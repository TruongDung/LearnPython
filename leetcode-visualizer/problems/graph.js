// Module of LeetCode Visualizer — category-specific builders and problem entries.

// External graph builders (kept separate due to size)
const {
  buildSteps1293,
  buildSteps1368,
  buildSteps2290,
  buildSteps2577,
  buildSteps3341,
  buildSteps3342,
  buildSteps1377,
  buildSteps126,
  buildSteps815,
} = require("../builders_graph");
const multiSourceBfsProblems = require("./multi-source-bfs");
const floodFillProblems = require("./flood-fill");

/**
 * LeetCode 127: Word Ladder I.
 * Standard BFS: return the LENGTH of the shortest transformation sequence
 * (number of words including beginWord and endWord), or 0 if impossible.
 */
function buildSteps127(input, params) {
  const approach = Number(params.approach) || 1;
  if (approach === 2 && typeof buildSteps127Bidir === "function") return buildSteps127Bidir(input, params);

  // ── Approach 1: One-way BFS ──
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

function parseBinaryGrid(input) {
  return String(input)
    .split("|")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((v) => Number(v.trim())));
}

function parseIslandGrid(input) {
  return String(input)
    .split("|")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const values = row.includes(",")
        ? row.split(",").map((v) => v.trim())
        : row.split("");
      return values.map((v) => String(v).replace(/^"|"$/g, ""));
    });
}

/**
 * LeetCode 200: Number of Islands.
 * Scan every cell. When an unvisited land cell is found, count a new island
 * and flood-fill its connected land cells in 4 directions.
 */
function buildSteps200(input) {
  const grid = parseIslandGrid(input);
  const steps = [];

  if (!grid.length || !grid[0].length || grid.some((row) => row.length !== grid[0].length || row.some((v) => v !== "0" && v !== "1"))) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [4, 5],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Grid phải gồm 0/1. Ví dụ: 11110|11010|11000|00000 hoặc 1,1,1,1,0|1,1,0,1,0.",
        en: "Grid must contain 0/1. Example: 11110|11010|11000|00000 or 1,1,1,1,0|1,1,0,1,0.",
      },
    });
    return { original: grid, answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const islandId = Array.from({ length: rows }, () => Array(cols).fill(0));
  const queued = new Set();
  const key = (r, c) => `${r},${c}`;

  function makeCells(current) {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        let cls = cell === "0" ? "wall" : "empty";
        let label = cell;
        if (visited[r][c]) {
          cls = "visited";
          label = String(islandId[r][c]);
        }
        if (queued.has(key(r, c))) cls = "queued";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current = null, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(current) },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Quét grid từ trái sang phải", en: "Scan the grid left to right" },
    codeLines: [4, 5, 6, 7],
    vars: [
      { name: "rows", value: rows },
      { name: "cols", value: cols },
      { name: "count", value: 0 },
    ],
    note: {
      vi: "Ta duyệt từng ô bằng row và col. Gặp đất '1' chưa thăm thì gọi dfs(row, col) để đánh dấu toàn bộ đảo trong visited.",
      en: "Scan every cell with row and col. An unvisited '1' triggers dfs(row, col), marking the whole island in visited.",
    },
  });

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let islands = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1" || visited[r][c]) continue;

      islands++;
      const stack = [[r, c]];
      visited[r][c] = true;
      islandId[r][c] = islands;
      queued.add(key(r, c));

      pushStep({
        title: { vi: `Gọi dfs(${r},${c}) cho đảo #${islands}`, en: `Call dfs(${r},${c}) for island #${islands}` },
        current: [r, c],
        codeLines: [24, 25, 26, 9, 10],
        vars: [
          { name: "row", value: r },
          { name: "col", value: c },
          { name: "count before dfs", value: islands - 1 },
          { name: "visited[row][col]", value: true },
        ],
        note: {
          vi: `Ô (${r},${c}) là đất chưa thăm. DFS bắt đầu bằng visited[${r}][${c}] = True, rồi lan 4 hướng.`,
          en: `Cell (${r},${c}) is unvisited land. DFS starts by setting visited[${r}][${c}] = True, then explores 4 directions.`,
        },
      });

      while (stack.length) {
        const [cr, cc] = stack.pop();
        queued.delete(key(cr, cc));

        pushStep({
          title: { vi: `DFS đang ở (${cr},${cc})`, en: `DFS at (${cr},${cc})` },
          current: [cr, cc],
          codeLines: [12, 13, 14, 16],
          vars: [
            { name: "row", value: cr },
            { name: "col", value: cc },
            { name: "island", value: islands },
            { name: "pending recursive calls", value: stack.length },
          ],
          note: {
            vi: `Từ (${cr},${cc}), thử từng direction. Nếu ra ngoài biên hoặc gặp '0' thì continue; nếu đất chưa visited thì gọi dfs tiếp.`,
            en: `From (${cr},${cc}), try each direction. Continue on out-of-bounds or '0'; recurse on unvisited land.`,
          },
        });

        for (const [dr, dc] of dirs) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (grid[nr][nc] !== "1" || visited[nr][nc]) continue;

          visited[nr][nc] = true;
          islandId[nr][nc] = islands;
          stack.push([nr, nc]);
          queued.add(key(nr, nc));

          pushStep({
            title: { vi: `dfs(${nr},${nc}) vì đất chưa visited`, en: `dfs(${nr},${nc}) because land is unvisited` },
            current: [nr, nc],
            codeLines: [18, 19],
            vars: [
              { name: "row", value: cr },
              { name: "col", value: cc },
              { name: "next_row", value: nr },
              { name: "next_col", value: nc },
              { name: "island", value: islands },
              { name: "visited[next_row][next_col]", value: true },
            ],
            note: {
              vi: `(${nr},${nc}) là đất kề 4 hướng và chưa visited, nên DFS đánh dấu nó thuộc cùng đảo #${islands}.`,
              en: `(${nr},${nc}) is 4-directionally adjacent unvisited land, so DFS marks it as part of island #${islands}.`,
            },
          });
        }
      }

      pushStep({
        title: { vi: `DFS xong → count = ${islands}`, en: `DFS done → count = ${islands}` },
        codeLines: [27],
        vars: [
          { name: "finished island", value: islands },
          { name: "count", value: islands },
        ],
        note: {
          vi: `Sau khi dfs(${r},${c}) quay về, toàn bộ đảo đã được visited. Lúc này mới count += 1.`,
          en: `After dfs(${r},${c}) returns, the whole island is visited. Now count += 1.`,
        },
      });
    }
  }

  pushStep({
    title: { vi: `Kết quả: ${islands} đảo`, en: `Result: ${islands} islands` },
    final: true,
    codeLines: [29],
    vars: [
      { name: "answer", value: islands },
      { name: "visited land cells", value: islandId.flat().filter(Boolean).length },
    ],
    note: {
      vi: `Mỗi lần gặp đất chưa thăm là một đảo mới. Sau khi DFS đánh dấu hết đất nối liền, tổng số đảo = ${islands}.`,
      en: `Each unvisited land cell starts one new island. After DFS marks all connected land, total islands = ${islands}.`,
    },
  });

  return { original: grid, answer: islands, steps };
}

/**
 * LeetCode 695: Max Area of Island.
 * Recursive DFS: dfs(r, c) marks the cell visited (sets it to 0) and returns
 * 1 + the area collected from all 4 neighbors. The outer loop keeps the max.
 * Matches the exact recursive code shown to the user, one code line per step.
 */
function buildSteps695(input) {
  const grid = parseIslandGrid(input);
  const steps = [];

  if (!grid.length || !grid[0].length || grid.some((row) => row.length !== grid[0].length || row.some((v) => v !== "0" && v !== "1"))) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Grid phải gồm 0/1. Ví dụ: 00100|01110|00100 hoặc 0,0,1,0,0|0,1,1,1,0.",
        en: "Grid must contain 0/1. Example: 00100|01110|00100 or 0,0,1,0,0|0,1,1,1,0.",
      },
    });
    return { original: grid, answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  // work[r][c]: same mutation the code performs (land 1 -> 0 once visited).
  const work = grid.map((row) => row.map((v) => Number(v)));
  const consumed = Array.from({ length: rows }, () => Array(cols).fill(false)); // land cell already dfs'd (for coloring)
  const islandId = Array.from({ length: rows }, () => Array(cols).fill(0));
  const key = (r, c) => `${r},${c}`;

  function makeCells(current, bestCells = new Set()) {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        const cellKey = key(r, c);
        let cls = cell === "0" ? "wall" : "empty";
        let label = cell;
        if (consumed[r][c]) {
          cls = "visited";
          label = String(islandId[r][c]);
        }
        if (bestCells.has(cellKey)) cls = "path";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current = null, bestCells, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(current, bestCells) },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  // Line 3: m, n = len(grid), len(grid[0])
  pushStep({
    title: { vi: "m, n = len(grid), len(grid[0])", en: "m, n = len(grid), len(grid[0])" },
    codeLines: [3],
    vars: [{ name: "m", value: rows }, { name: "n", value: cols }],
    note: { vi: `Lưới có ${rows} dòng, ${cols} cột.`, en: `The grid has ${rows} rows, ${cols} columns.` },
  });

  // Line 4: max_area = 0
  let maxArea = 0;
  pushStep({
    title: { vi: "max_area = 0", en: "max_area = 0" },
    codeLines: [4],
    vars: [{ name: "max_area", value: maxArea }],
    note: { vi: "Biến lưu diện tích đảo lớn nhất tìm được.", en: "Tracks the largest island area found so far." },
  });

  const DIRS = [
    { dr: 1, dc: 0, label: "dfs(r+1, c)" },
    { dr: -1, dc: 0, label: "dfs(r-1, c)" },
    { dr: 0, dc: 1, label: "dfs(r, c+1)" },
    { dr: 0, dc: -1, label: "dfs(r, c-1)" },
  ];

  let island = 0;
  let bestCells = new Set();
  let currentIslandCells = [];

  function dfs(r, c, depth) {
    // Line 7: boundary check
    const outOfBounds = r < 0 || r === rows || c < 0 || c === cols;
    pushStep({
      title: { vi: `dfs(${r},${c}): kiểm tra biên`, en: `dfs(${r},${c}): boundary check` },
      current: outOfBounds ? null : [r, c],
      codeLines: [7],
      vars: [{ name: "r,c", value: `${r},${c}` }, { name: "out of bounds?", value: outOfBounds }],
      note: {
        vi: outOfBounds ? `(${r},${c}) nằm ngoài lưới.` : `(${r},${c}) nằm trong lưới, tiếp tục kiểm tra.`,
        en: outOfBounds ? `(${r},${c}) is outside the grid.` : `(${r},${c}) is inside the grid, keep checking.`,
      },
    });
    if (outOfBounds) {
      // Line 8: return 0
      pushStep({
        title: { vi: "return 0 (ngoài biên)", en: "return 0 (out of bounds)" },
        bestCells,
        codeLines: [8],
        vars: [{ name: "returns", value: 0 }],
        note: { vi: "Ngoài lưới không đóng góp diện tích.", en: "Outside the grid contributes no area." },
      });
      return 0;
    }

    // Line 9: if grid[r][c] == 0
    const isWaterOrVisited = work[r][c] === 0;
    pushStep({
      title: { vi: `dfs(${r},${c}): grid[r][c] == 0?`, en: `dfs(${r},${c}): grid[r][c] == 0?` },
      current: [r, c],
      bestCells,
      codeLines: [9],
      vars: [{ name: "grid[r][c]", value: work[r][c] }],
      note: {
        vi: isWaterOrVisited ? `(${r},${c}) là nước hoặc đã thăm.` : `(${r},${c}) là đất chưa thăm.`,
        en: isWaterOrVisited ? `(${r},${c}) is water or already visited.` : `(${r},${c}) is unvisited land.`,
      },
    });
    if (isWaterOrVisited) {
      // Line 10: return 0
      pushStep({
        title: { vi: "return 0 (nước / đã thăm)", en: "return 0 (water / already visited)" },
        current: [r, c],
        bestCells,
        codeLines: [10],
        vars: [{ name: "returns", value: 0 }],
        note: { vi: "Không đếm lại ô này.", en: "Do not count this cell again." },
      });
      return 0;
    }

    // Line 11: grid[r][c] = 0  (mark visited)
    work[r][c] = 0;
    consumed[r][c] = true;
    islandId[r][c] = island;
    currentIslandCells.push(key(r, c));
    pushStep({
      title: { vi: `grid[${r}][${c}] = 0 (đánh dấu đã thăm)`, en: `grid[${r}][${c}] = 0 (mark visited)` },
      current: [r, c],
      bestCells,
      codeLines: [11],
      vars: [{ name: "grid[r][c]", value: 0 }],
      note: { vi: `Đánh dấu (${r},${c}) đã thăm, thuộc đảo #${island}.`, en: `Mark (${r},${c}) visited, part of island #${island}.` },
    });

    // Line 12: return 1 + dfs(...) x4 — walk through the single line step by step.
    let total = 1;
    pushStep({
      title: { vi: "total = 1 (tính cả ô hiện tại)", en: "total = 1 (count this cell)" },
      current: [r, c],
      bestCells,
      codeLines: [12],
      vars: [{ name: "total", value: total }],
      note: { vi: `Ô (${r},${c}) tự đóng góp 1 vào diện tích.`, en: `Cell (${r},${c}) contributes 1 to the area by itself.` },
    });

    for (const { dr, dc, label } of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      pushStep({
        title: { vi: `Gọi ${label}`, en: `Call ${label}` },
        current: [r, c],
        bestCells,
        codeLines: [12],
        vars: [{ name: "calling", value: `(${nr}, ${nc})` }, { name: "total so far", value: total }],
        note: { vi: `Đệ quy tiếp vào (${nr},${nc}).`, en: `Recurse into (${nr},${nc}).` },
      });
      const child = dfs(nr, nc, depth + 1);
      total += child;
      pushStep({
        title: { vi: `${label} trả về ${child} → total = ${total}`, en: `${label} returned ${child} → total = ${total}` },
        current: [r, c],
        bestCells,
        codeLines: [12],
        vars: [{ name: "returned", value: child }, { name: "total", value: total }],
        note: { vi: `Cộng kết quả từ (${nr},${nc}) vào total.`, en: `Add the result from (${nr},${nc}) into total.` },
      });
    }

    pushStep({
      title: { vi: `return ${total}`, en: `return ${total}` },
      current: [r, c],
      bestCells,
      codeLines: [12],
      vars: [{ name: "returns", value: total }],
      note: { vi: `dfs(${r},${c}) hoàn tất, trả về diện tích ${total}.`, en: `dfs(${r},${c}) finishes, returning area ${total}.` },
    });
    return total;
  }

  for (let r = 0; r < rows; r++) {
    // Line 14: for r in range(m)
    pushStep({
      title: { vi: `for r in range(m): r = ${r}`, en: `for r in range(m): r = ${r}` },
      bestCells,
      codeLines: [14],
      vars: [{ name: "r", value: r }, { name: "max_area", value: maxArea }],
      note: { vi: `Xét dòng ${r}.`, en: `Scan row ${r}.` },
    });

    for (let c = 0; c < cols; c++) {
      // Line 15: for c in range(n)
      pushStep({
        title: { vi: `for c in range(n): c = ${c}`, en: `for c in range(n): c = ${c}` },
        current: [r, c],
        bestCells,
        codeLines: [15],
        vars: [{ name: "c", value: c }, { name: "grid[r][c]", value: work[r][c] }],
        note: { vi: `Xét ô (${r},${c}).`, en: `Check cell (${r},${c}).` },
      });

      // Line 16: if grid[r][c] == 1
      const isLand = work[r][c] === 1;
      pushStep({
        title: { vi: `grid[${r}][${c}] == 1?`, en: `grid[${r}][${c}] == 1?` },
        current: [r, c],
        bestCells,
        codeLines: [16],
        vars: [{ name: "grid[r][c]", value: work[r][c] }, { name: "is land?", value: isLand }],
        note: {
          vi: isLand ? `(${r},${c}) là đất chưa thăm → bắt đầu đo đảo mới.` : `(${r},${c}) là nước hoặc đã thăm → bỏ qua.`,
          en: isLand ? `(${r},${c}) is unvisited land → start measuring a new island.` : `(${r},${c}) is water or visited → skip.`,
        },
      });
      if (!isLand) continue;

      island++;
      currentIslandCells = [];

      // Line 17: area = dfs(r, c)
      pushStep({
        title: { vi: `area = dfs(${r}, ${c})`, en: `area = dfs(${r}, ${c})` },
        current: [r, c],
        bestCells,
        codeLines: [17],
        vars: [{ name: "island", value: island }],
        note: { vi: `Gọi DFS để đo diện tích đảo #${island} bắt đầu từ (${r},${c}).`, en: `Call DFS to measure island #${island} starting at (${r},${c}).` },
      });
      const area = dfs(r, c, 0);
      pushStep({
        title: { vi: `area = ${area}`, en: `area = ${area}` },
        bestCells,
        codeLines: [17],
        vars: [{ name: "area", value: area }, { name: "island", value: island }],
        note: { vi: `dfs trả về diện tích đảo #${island} = ${area}.`, en: `dfs returned island #${island}'s area = ${area}.` },
      });

      // Line 18: max_area = max(max_area, area)
      const isNewMax = area > maxArea;
      maxArea = Math.max(maxArea, area);
      if (isNewMax) bestCells = new Set(currentIslandCells);
      pushStep({
        title: { vi: `max_area = max(max_area, area) = ${maxArea}`, en: `max_area = max(max_area, area) = ${maxArea}` },
        bestCells,
        codeLines: [18],
        vars: [{ name: "area", value: area }, { name: "max_area", value: maxArea } ],
        note: {
          vi: isNewMax ? `Đảo #${island} (area=${area}) lớn hơn kỷ lục cũ → cập nhật max_area.` : `Đảo #${island} (area=${area}) không vượt max_area hiện tại (${maxArea}).`,
          en: isNewMax ? `Island #${island} (area=${area}) beats the previous record → update max_area.` : `Island #${island} (area=${area}) does not exceed current max_area (${maxArea}).`,
        },
      });
    }
  }

  // Line 19: return max_area
  pushStep({
    title: { vi: `return ${maxArea}`, en: `return ${maxArea}` },
    bestCells,
    final: true,
    codeLines: [19],
    vars: [{ name: "answer", value: maxArea }, { name: "islands scanned", value: island }],
    note: {
      vi: `Sau khi đo toàn bộ đảo, diện tích lớn nhất là ${maxArea}. Nếu grid toàn nước thì kết quả sẽ là 0.`,
      en: `After measuring every island, the largest area is ${maxArea}. If the grid is all water, the result is 0.`,
    },
  });

  return { original: grid, answer: maxArea, steps };
}

/**
 * LeetCode 695 Approach 2: Recursive DFS.
 * Same result — mark visited by setting grid[r][c] = 0 in-place.
 * Code lines (1-indexed match code2 array):
 *  1  class Solution:
 *  2      def maxAreaOfIsland(self, grid):
 *  3          m, n = len(grid), len(grid[0])
 *  4          max_area = 0
 *  5          def dfs(r, c):
 *  6              if r < 0 or r == m or c < 0 or c == n:
 *  7                  return 0
 *  8              if grid[r][c] == 0:
 *  9                  return 0
 * 10              grid[r][c] = 0
 * 11              return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1)
 * 12          for r in range(m):
 * 13              for c in range(n):
 * 14                  if grid[r][c] == 1:
 * 15                      area = dfs(r, c)
 * 16                      max_area = max(max_area, area)
 * 17          return max_area
 */
function buildSteps695v2(input) {
  const grid = parseIslandGrid(input);
  const steps = [];

  if (!grid.length || !grid[0].length || grid.some((row) => row.length !== grid[0].length || row.some((v) => v !== "0" && v !== "1"))) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], codeBlock: 2,
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true, codeLines: [3], vars: [{ name: "answer", value: 0 }],
      note: { vi: "Grid phải gồm 0/1.", en: "Grid must contain 0/1." },
    });
    return { original: grid, answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const work = grid.map((row) => row.map((v) => Number(v)));
  const consumed = Array.from({ length: rows }, () => Array(cols).fill(false));
  const islandId = Array.from({ length: rows }, () => Array(cols).fill(0));
  const key = (r, c) => `${r},${c}`;

  function makeCells(current, bestCells = new Set()) {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        let cls = cell === "0" ? "wall" : "empty";
        let label = cell;
        if (consumed[r][c]) { cls = "visited"; label = String(islandId[r][c]); }
        if (bestCells.has(key(r, c))) cls = "path";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep(opts) {
    steps.push({
      title: opts.title, arr: [], codeBlock: 2,
      bfsGrid: { rows, cols, cells: makeCells(opts.current || null, opts.bestCells || new Set()) },
      highlight: [], mark: [], final: opts.final || false,
      codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  pushStep({
    title: { vi: "m, n = len(grid), len(grid[0])", en: "m, n = len(grid), len(grid[0])" },
    codeLines: [3], vars: [{ name: "m", value: rows }, { name: "n", value: cols }],
    note: { vi: `Lưới ${rows}×${cols}. DFS đệ quy: đánh dấu ô đất bằng cách ghi đè grid[r][c]=0.`, en: `Grid ${rows}×${cols}. Recursive DFS: mark cells by overwriting grid[r][c]=0.` },
  });

  let maxArea = 0;
  pushStep({
    title: { vi: "max_area = 0", en: "max_area = 0" },
    codeLines: [4], vars: [{ name: "max_area", value: 0 }],
    note: { vi: "Khởi tạo kết quả.", en: "Initialize the result." },
  });

  let island = 0;
  let bestCells = new Set();
  let currentIslandCells = [];

  function dfs(r, c) {
    // boundary
    const oob = r < 0 || r === rows || c < 0 || c === cols;
    pushStep({
      title: { vi: `dfs(${r},${c}): biên?`, en: `dfs(${r},${c}): boundary?` },
      current: oob ? null : [r, c], bestCells,
      codeLines: [6],
      vars: [{ name: "r,c", value: `${r},${c}` }, { name: "out of bounds", value: oob }],
      note: { vi: oob ? `(${r},${c}) ngoài lưới → return 0.` : `(${r},${c}) trong lưới.`, en: oob ? `(${r},${c}) out of bounds → return 0.` : `(${r},${c}) inside grid.` },
    });
    if (oob) {
      pushStep({ title: { vi: "return 0 (ngoài biên)", en: "return 0 (out of bounds)" }, bestCells, codeLines: [7], vars: [{ name: "returns", value: 0 }], note: { vi: "Ngoài lưới.", en: "Out of bounds." } });
      return 0;
    }
    // water / visited
    const water = work[r][c] === 0;
    pushStep({
      title: { vi: `dfs(${r},${c}): grid[r][c]==0?`, en: `dfs(${r},${c}): grid[r][c]==0?` },
      current: [r, c], bestCells, codeLines: [8],
      vars: [{ name: "grid[r][c]", value: work[r][c] }],
      note: { vi: water ? `(${r},${c}) là nước/đã thăm → return 0.` : `(${r},${c}) là đất.`, en: water ? `(${r},${c}) is water/visited → return 0.` : `(${r},${c}) is land.` },
    });
    if (water) {
      pushStep({ title: { vi: "return 0 (nước/đã thăm)", en: "return 0 (water/visited)" }, current: [r, c], bestCells, codeLines: [9], vars: [{ name: "returns", value: 0 }], note: { vi: "Không đếm.", en: "Not counted." } });
      return 0;
    }
    // mark
    work[r][c] = 0; consumed[r][c] = true; islandId[r][c] = island;
    currentIslandCells.push(key(r, c));
    pushStep({
      title: { vi: `grid[${r}][${c}] = 0 (mark visited)`, en: `grid[${r}][${c}] = 0 (mark visited)` },
      current: [r, c], bestCells, codeLines: [10],
      vars: [{ name: "grid[r][c]", value: 0 }],
      note: { vi: `Đánh dấu đã thăm. Đệ quy 4 hướng.`, en: `Marked visited. Recurse in 4 directions.` },
    });
    // recurse
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const dirLabels = ["r+1,c","r-1,c","r,c+1","r,c-1"];
    let total = 1;
    for (let d = 0; d < 4; d++) {
      const [dr, dc] = dirs[d];
      const nr = r + dr, nc = c + dc;
      pushStep({
        title: { vi: `Gọi dfs(${nr},${nc}) [${dirLabels[d]}]`, en: `Call dfs(${nr},${nc}) [${dirLabels[d]}]` },
        current: [r, c], bestCells, codeLines: [11],
        vars: [{ name: "calling", value: `(${nr},${nc})` }, { name: "total so far", value: total }],
        note: { vi: `Đệ quy vào (${nr},${nc}).`, en: `Recurse into (${nr},${nc}).` },
      });
      const child = dfs(nr, nc);
      total += child;
      pushStep({
        title: { vi: `dfs(${nr},${nc}) = ${child} → total = ${total}`, en: `dfs(${nr},${nc}) = ${child} → total = ${total}` },
        current: [r, c], bestCells, codeLines: [11],
        vars: [{ name: "returned", value: child }, { name: "total", value: total }],
        note: { vi: `Cộng ${child} vào total.`, en: `Add ${child} to total.` },
      });
    }
    pushStep({
      title: { vi: `return ${total}`, en: `return ${total}` },
      current: [r, c], bestCells, codeLines: [11],
      vars: [{ name: "returns", value: total }],
      note: { vi: `dfs(${r},${c}) trả về ${total}.`, en: `dfs(${r},${c}) returns ${total}.` },
    });
    return total;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pushStep({
        title: { vi: `r=${r}, c=${c}: grid[r][c]=${work[r][c]}`, en: `r=${r}, c=${c}: grid[r][c]=${work[r][c]}` },
        current: [r, c], bestCells, codeLines: [12, 13, 14],
        vars: [{ name: "r,c", value: `${r},${c}` }, { name: "grid[r][c]", value: work[r][c] }, { name: "max_area", value: maxArea }],
        note: { vi: work[r][c] === 1 ? `(${r},${c}) là đất → DFS.` : `(${r},${c}) bỏ qua.`, en: work[r][c] === 1 ? `(${r},${c}) is land → DFS.` : `(${r},${c}) skip.` },
      });
      if (work[r][c] !== 1) continue;
      island++;
      currentIslandCells = [];
      const area = dfs(r, c);
      const isNewMax = area > maxArea;
      maxArea = Math.max(maxArea, area);
      if (isNewMax) bestCells = new Set(currentIslandCells);
      pushStep({
        title: { vi: `max_area = max(${maxArea - (isNewMax ? 0 : area)}, ${area}) = ${maxArea}`, en: `max_area = max(${maxArea - (isNewMax ? 0 : area)}, ${area}) = ${maxArea}` },
        bestCells, codeLines: [15, 16],
        vars: [{ name: "area", value: area }, { name: "max_area", value: maxArea }],
        note: { vi: isNewMax ? `Đảo #${island} (${area}) là kỷ lục mới.` : `Đảo #${island} (${area}) không vượt max.`, en: isNewMax ? `Island #${island} (${area}) is new record.` : `Island #${island} (${area}) doesn't beat max.` },
      });
    }
  }

  pushStep({
    title: { vi: `return ${maxArea}`, en: `return ${maxArea}` },
    bestCells, final: true, codeLines: [17],
    vars: [{ name: "answer", value: maxArea }],
    note: { vi: `Diện tích đảo lớn nhất = ${maxArea}.`, en: `Largest island area = ${maxArea}.` },
  });
  return { original: grid, answer: maxArea, steps };
}

/**
 * LeetCode 542: 01 Matrix.
 * Multi-source BFS starts from every zero and assigns each one its shortest
 * distance to a zero. Every trace step maps to exactly one displayed line.
 */
function buildSteps542(input) {
  const parsed = parseIslandGrid(input);
  const original = parsed.map((row) => row.map(Number));
  const steps = [];
  const invalid = !parsed.length || !parsed[0].length ||
    !parsed.some((row) => row.includes("0")) || parsed.some((row) =>
      row.length !== parsed[0].length || row.some((value) => value !== "0" && value !== "1")
    );

  if (invalid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [5],
      vars: [{ name: "answer", value: "invalid grid" }],
      note: {
        vi: "Matrix phải là ma trận chữ nhật chỉ gồm 0 và 1, đồng thời có ít nhất một ô 0.",
        en: "The matrix must be rectangular, contain only 0 and 1, and include at least one zero.",
      },
    });
    return { original, answer: [], steps };
  }

  const rows = parsed.length;
  const cols = parsed[0].length;
  let distances = null;
  let queue = null;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (row, col) => `${row},${col}`;

  function queueLabel() {
    if (queue === null) return "not initialized";
    return `[${queue.map(([row, col]) => `(${row},${col})`).join(", ")}]`;
  }

  function makeCells(current = null, discovered = null) {
    const queued = new Set((queue || []).map(([row, col]) => key(row, col)));
    return parsed.map((matrixRow, row) => matrixRow.map((value, col) => {
      const distance = distances === null ? null : distances[row][col];
      let label = distance === null ? value : distance === -1 ? "∞" : String(distance);
      let cls = distance === null || distance === -1 ? "empty" : "visited";
      if (queued.has(key(row, col))) cls = "queued";
      if (discovered && discovered[0] === row && discovered[1] === col) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label, cls };
    }));
  }

  function pushStep({ codeLine, title, note, current = null, discovered = null, vars = [], final = false }) {
    const debugVars = [...vars];
    if (!debugVars.some((item) => item.name === "queue")) {
      debugVars.push({ name: "queue", value: queueLabel() });
    }
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(current, discovered) },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars: debugVars,
      note,
    });
  }

  pushStep({
    codeLine: 5,
    title: { vi: "Bắt đầu updateMatrix", en: "Enter updateMatrix" },
    vars: [{ name: "matrix size", value: `${rows}×${cols}` }],
    note: { vi: "Bắt đầu hàm với matrix đầu vào.", en: "Enter the function with the input matrix." },
  });

  pushStep({
    codeLine: 6,
    title: { vi: `rows=${rows}, cols=${cols}`, en: `rows=${rows}, cols=${cols}` },
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: { vi: "Lưu số hàng và số cột.", en: "Store the row and column counts." },
  });

  distances = Array.from({ length: rows }, () => Array(cols).fill(-1));
  pushStep({
    codeLine: 7,
    title: { vi: "Khởi tạo distances = -1", en: "Initialize distances to -1" },
    vars: [{ name: "unvisited", value: "-1 (shown as ∞)" }],
    note: {
      vi: "-1 nghĩa là ô chưa có khoảng cách; grid hiển thị ký hiệu ∞ cho dễ nhìn.",
      en: "-1 means the cell has no distance yet; the grid displays it as ∞.",
    },
  });

  queue = [];
  pushStep({
    codeLine: 8,
    title: { vi: "queue = deque()", en: "queue = deque()" },
    note: { vi: "Tạo queue rỗng cho multi-source BFS.", en: "Create an empty queue for multi-source BFS." },
  });

  for (let row = 0; row < rows; row++) {
    pushStep({
      codeLine: 9,
      title: { vi: `Quét row = ${row}`, en: `Scan row = ${row}` },
      vars: [{ name: "row", value: row }],
      note: { vi: `Bắt đầu quét hàng ${row}.`, en: `Begin scanning row ${row}.` },
    });

    for (let col = 0; col < cols; col++) {
      pushStep({
        codeLine: 10,
        title: { vi: `Quét ô (${row},${col})`, en: `Scan cell (${row},${col})` },
        current: [row, col],
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "mat[row][col]", value: parsed[row][col] }],
        note: { vi: `Xét ô (${row},${col}).`, en: `Inspect cell (${row},${col}).` },
      });

      const isZero = parsed[row][col] === "0";
      pushStep({
        codeLine: 11,
        title: { vi: `mat[${row}][${col}] == 0 → ${isZero}`, en: `mat[${row}][${col}] == 0 → ${isZero}` },
        current: [row, col],
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "is zero?", value: isZero }],
        note: isZero
          ? { vi: "Đây là một nguồn BFS có khoảng cách bằng 0.", en: "This is a BFS source with distance zero." }
          : { vi: "Ô 1 chưa biết khoảng cách; giữ nguyên -1.", en: "This 1-cell has no known distance yet; leave it at -1." },
      });

      if (!isZero) continue;
      distances[row][col] = 0;
      pushStep({
        codeLine: 12,
        title: { vi: `distances[${row}][${col}] = 0`, en: `distances[${row}][${col}] = 0` },
        current: [row, col],
        vars: [{ name: "row", value: row }, { name: "col", value: col }],
        note: { vi: "Khoảng cách từ ô 0 đến chính nó là 0.", en: "A zero's distance to itself is 0." },
      });

      queue.push([row, col]);
      pushStep({
        codeLine: 13,
        title: { vi: `queue.append((${row},${col}))`, en: `queue.append((${row},${col}))` },
        current: [row, col],
        vars: [{ name: "row", value: row }, { name: "col", value: col }],
        note: { vi: "Thêm nguồn 0 vào queue.", en: "Append this zero source to the queue." },
      });
    }
  }

  pushStep({
    codeLine: 14,
    title: { vi: "Khai báo 4 hướng", en: "Define four directions" },
    vars: [{ name: "directions", value: "down, up, right, left" }],
    note: { vi: "BFS di chuyển theo bốn hướng.", en: "BFS moves in four directions." },
  });

  while (queue.length) {
    pushStep({
      codeLine: 15,
      title: { vi: "while queue → True", en: "while queue → True" },
      vars: [{ name: "condition", value: true }],
      note: { vi: "Queue còn ô cần mở rộng.", en: "The queue still has a cell to expand." },
    });

    const [row, col] = queue.shift();
    pushStep({
      codeLine: 16,
      title: { vi: `popleft → (${row},${col})`, en: `popleft → (${row},${col})` },
      current: [row, col],
      vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "distance", value: distances[row][col] }],
      note: { vi: `Lấy ô (${row},${col}) khỏi đầu queue.`, en: `Remove cell (${row},${col}) from the queue front.` },
    });

    for (const [deltaRow, deltaCol] of directions) {
      pushStep({
        codeLine: 17,
        title: { vi: `Thử hướng (${deltaRow},${deltaCol})`, en: `Try direction (${deltaRow},${deltaCol})` },
        current: [row, col],
        vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }],
        note: { vi: "Xét một ô lân cận.", en: "Inspect one neighboring cell." },
      });

      const nextRow = row + deltaRow;
      const nextCol = col + deltaCol;
      pushStep({
        codeLine: 18,
        title: { vi: `next = (${nextRow},${nextCol})`, en: `next = (${nextRow},${nextCol})` },
        current: [row, col],
        vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
        note: { vi: "Tính tọa độ ô kế tiếp.", en: "Compute the neighboring coordinates." },
      });

      const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
      const unvisited = inBounds && distances[nextRow][nextCol] === -1;
      pushStep({
        codeLine: 19,
        title: { vi: `Ô (${nextRow},${nextCol}) hợp lệ và chưa thăm → ${unvisited}`, en: `Cell (${nextRow},${nextCol}) is valid and unvisited → ${unvisited}` },
        current: inBounds ? [nextRow, nextCol] : [row, col],
        vars: [{ name: "in bounds?", value: inBounds }, { name: "unvisited?", value: unvisited }],
        note: unvisited
          ? { vi: "Đây là lần đầu BFS tới ô này, nên khoảng cách tìm được là ngắn nhất.", en: "This is the first BFS visit, so the discovered distance is shortest." }
          : { vi: "Ô ngoài biên hoặc đã có khoảng cách; bỏ qua.", en: "The cell is out of bounds or already has a distance; skip it." },
      });
      if (!unvisited) continue;

      distances[nextRow][nextCol] = distances[row][col] + 1;
      pushStep({
        codeLine: 20,
        title: { vi: `distance(${nextRow},${nextCol}) = ${distances[nextRow][nextCol]}`, en: `distance(${nextRow},${nextCol}) = ${distances[nextRow][nextCol]}` },
        current: [nextRow, nextCol],
        discovered: [nextRow, nextCol],
        vars: [
          { name: "distances[row][col]", value: distances[row][col] },
          { name: "distances[next_row][next_col]", value: distances[nextRow][nextCol] },
        ],
        note: { vi: "Khoảng cách ô mới bằng khoảng cách ô hiện tại cộng 1.", en: "The new distance is the current cell's distance plus 1." },
      });

      queue.push([nextRow, nextCol]);
      pushStep({
        codeLine: 21,
        title: { vi: `queue.append((${nextRow},${nextCol}))`, en: `queue.append((${nextRow},${nextCol}))` },
        current: [nextRow, nextCol],
        discovered: [nextRow, nextCol],
        vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
        note: { vi: "Thêm ô vừa khám phá để tiếp tục mở rộng BFS.", en: "Append the discovered cell so BFS can expand from it." },
      });
    }
  }

  pushStep({
    codeLine: 15,
    title: { vi: "while queue → False", en: "while queue → False" },
    vars: [{ name: "condition", value: false }],
    note: { vi: "Queue rỗng; mọi ô đã có khoảng cách gần nhất.", en: "The queue is empty; every cell has its nearest-zero distance." },
  });

  const answer = distances.map((row) => [...row]);
  pushStep({
    codeLine: 22,
    title: { vi: "return distances", en: "return distances" },
    final: true,
    vars: [{ name: "answer", value: JSON.stringify(answer) }],
    note: { vi: "Trả về ma trận khoảng cách hoàn chỉnh.", en: "Return the completed distance matrix." },
  });

  return { original, answer, steps };
}

/**
 * LeetCode 994: Rotting Oranges.
 * Multi-source BFS: all initially rotten oranges spread rot at the same time.
 */
function buildSteps994(input) {
  const grid = parseIslandGrid(input);
  const original = grid.map((row) => [...row]);
  const steps = [];

  if (!grid.length || !grid[0].length || grid.some((row) => row.length !== grid[0].length || row.some((v) => v !== "0" && v !== "1" && v !== "2"))) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [4, 5],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid phải gồm 0, 1, 2. Ví dụ: 2,1,1|1,1,0|0,1,1 hoặc viết gọn: 211|110|011.",
        en: "Grid must contain 0, 1, 2. Example: 2,1,1|1,1,0|0,1,1 or compact: 211|110|011.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const rottenAt = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const key = (r, c) => `${r},${c}`;
  let fresh = 0;
  let queue = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") fresh++;
      if (grid[r][c] === "2") {
        rottenAt[r][c] = 0;
        queue.push([r, c]);
      }
    }
  }

  function makeCells(current = null, frontier = new Set(), newlyRotten = new Set()) {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        const cellKey = key(r, c);
        let cls = "empty";
        let label = cell;
        if (cell === "0") {
          cls = "wall";
          label = "";
        } else if (rottenAt[r][c] >= 0) {
          cls = "visited";
          label = rottenAt[r][c] === 0 ? "2" : String(rottenAt[r][c]);
        }
        if (frontier.has(cellKey)) cls = "queued";
        if (newlyRotten.has(cellKey)) cls = "path";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current = null, frontier, newlyRotten, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(current, frontier, newlyRotten) },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Khởi tạo multi-source BFS", en: "Initialize multi-source BFS" },
    frontier: new Set(queue.map(([r, c]) => key(r, c))),
    codeLines: [4, 5, 6, 7, 8, 9],
    vars: [
      { name: "initial rotten", value: queue.length },
      { name: "fresh", value: fresh },
      { name: "minutes", value: 0 },
    ],
    note: {
      vi: "Tất cả cam thối ban đầu là nguồn BFS. Mỗi level của BFS tương ứng 1 phút lan sang các cam tươi kề 4 hướng.",
      en: "All initially rotten oranges are BFS sources. Each BFS level is one minute of spreading to 4-directionally adjacent fresh oranges.",
    },
  });

  if (fresh === 0) {
    pushStep({
      title: { vi: "Không có cam tươi → 0 phút", en: "No fresh oranges → 0 minutes" },
      final: true,
      codeLines: [10, 11],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Grid không có cam tươi, nên không cần chờ phút nào.",
        en: "There are no fresh oranges, so no time is needed.",
      },
    });
    return { original: grid, answer: 0, steps };
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;

  while (queue.length && fresh > 0) {
    const next = [];
    const rottedThisMinute = [];
    const frontier = new Set(queue.map(([r, c]) => key(r, c)));

    for (const [r, c] of queue) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (grid[nr][nc] !== "1" || rottenAt[nr][nc] >= 0) continue;

        rottenAt[nr][nc] = minutes + 1;
        fresh--;
        next.push([nr, nc]);
        rottedThisMinute.push([nr, nc]);
      }
    }

    if (!rottedThisMinute.length) break;
    minutes++;

    pushStep({
      title: { vi: `Phút ${minutes}: thối ${rottedThisMinute.length} cam`, en: `Minute ${minutes}: rot ${rottedThisMinute.length} orange(s)` },
      frontier,
      newlyRotten: new Set(rottedThisMinute.map(([r, c]) => key(r, c))),
      codeLines: [12, 13, 14, 15, 16, 17, 18],
      vars: [
        { name: "minute", value: minutes },
        { name: "rotted now", value: rottedThisMinute.map(([r, c]) => `(${r},${c})`).join(", ") },
        { name: "fresh left", value: fresh },
        { name: "next frontier", value: next.length },
      ],
      note: {
        vi: `Các cam đang thối ở đầu phút lan sang cam tươi kề 4 hướng. Sau phút ${minutes}, còn ${fresh} cam tươi.`,
        en: `The current rotten frontier spreads to adjacent fresh oranges. After minute ${minutes}, ${fresh} fresh orange(s) remain.`,
      },
    });

    queue = next;
  }

  const answer = fresh === 0 ? minutes : -1;
  pushStep({
    title: answer === -1
      ? { vi: "Còn cam tươi bị cô lập → -1", en: "Fresh oranges remain isolated → -1" }
      : { vi: `Kết quả: ${minutes} phút`, en: `Result: ${minutes} minutes` },
    final: true,
    codeLines: [19, 20],
    vars: [
      { name: "fresh left", value: fresh },
      { name: "answer", value: answer },
    ],
    note: {
      vi: answer === -1
        ? "BFS dừng nhưng vẫn còn cam tươi, nghĩa là chúng không thể bị lan thối từ bất kỳ cam thối nào."
        : `Tất cả cam tươi đã bị thối sau ${minutes} phút.`,
      en: answer === -1
        ? "BFS stopped while fresh oranges remain, so they cannot be reached by rot from any rotten orange."
        : `All fresh oranges have rotted after ${minutes} minute(s).`,
    },
  });

  return { original, answer, steps };
}

/**
 * LeetCode 994: exact line-by-line multi-source BFS trace.
 * This detailed builder mirrors every executable line in the displayed Python.
 */
function buildSteps994LineByLine(input) {
  const parsed = parseIslandGrid(input);
  const original = parsed.map((row) => [...row]);
  const grid = parsed.map((row) => [...row]);
  const steps = [];

  const invalid = !grid.length || !grid[0].length || grid.some((row) =>
    row.length !== grid[0].length || row.some((value) => value !== "0" && value !== "1" && value !== "2")
  );
  if (invalid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [4],
      vars: [{ name: "answer", value: -1 }],
      note: { vi: "Grid phải là ma trận chữ nhật chỉ gồm 0, 1, 2.", en: "The grid must be rectangular and contain only 0, 1, and 2." },
    });
    return { original, answer: -1, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const rottenAt = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (row, col) => `${row},${col}`;
  let queue = null;
  let fresh = null;
  let minutes = null;

  function queueLabel() {
    if (queue === null) return "not initialized";
    return `[${queue.map(([row, col]) => `(${row},${col})`).join(", ")}]`;
  }

  function makeCells(current = null, newlyRotten = new Set()) {
    const queued = new Set((queue || []).map(([row, col]) => key(row, col)));
    return grid.map((gridRow, row) => gridRow.map((cell, col) => {
      const cellKey = key(row, col);
      let cls = cell === "0" ? "wall" : cell === "1" ? "empty" : "visited";
      let label = cell === "0" ? "" : cell;
      if (cell === "2" && rottenAt[row][col] > 0) label = String(rottenAt[row][col]);
      if (queued.has(cellKey)) cls = "queued";
      if (newlyRotten.has(cellKey)) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label, cls };
    }));
  }

  function pushStep(opts) {
    const vars = [...(opts.vars || [])];
    if (!vars.some((item) => item.name === "queue")) vars.push({ name: "queue", value: queueLabel() });
    if (!vars.some((item) => item.name === "fresh")) vars.push({ name: "fresh", value: fresh === null ? "not initialized" : fresh });
    if (!vars.some((item) => item.name === "minutes")) vars.push({ name: "minutes", value: minutes === null ? "not initialized" : minutes });
    steps.push({
      title: opts.title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(opts.current, opts.newlyRotten) },
      highlight: [],
      mark: [],
      final: Boolean(opts.final),
      codeLines: [opts.codeLine],
      vars,
      note: opts.note,
    });
  }

  pushStep({
    title: { vi: "Bắt đầu orangesRotting", en: "Enter orangesRotting" },
    codeLine: 4,
    vars: [{ name: "grid size", value: `${rows}×${cols}` }],
    note: { vi: "Bắt đầu hàm với grid đầu vào.", en: "Enter the function with the input grid." },
  });

  pushStep({
    title: { vi: `rows=${rows}, cols=${cols}`, en: `rows=${rows}, cols=${cols}` },
    codeLine: 5,
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: { vi: "Lưu số hàng và số cột bằng tên rõ nghĩa.", en: "Store the row and column counts with descriptive names." },
  });

  queue = [];
  pushStep({
    title: { vi: "queue = deque()", en: "queue = deque()" },
    codeLine: 6,
    note: { vi: "Tạo queue cho multi-source BFS.", en: "Create the queue for multi-source BFS." },
  });

  fresh = 0;
  pushStep({
    title: { vi: "fresh = 0", en: "fresh = 0" },
    codeLine: 7,
    note: { vi: "Bắt đầu đếm số cam tươi.", en: "Start counting fresh oranges." },
  });

  for (let row = 0; row < rows; row++) {
    pushStep({
      title: { vi: `Quét row = ${row}`, en: `Scan row = ${row}` },
      codeLine: 8,
      vars: [{ name: "row", value: row }],
      note: { vi: `Bắt đầu quét hàng ${row}.`, en: `Begin scanning row ${row}.` },
    });

    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      pushStep({
        title: { vi: `Quét ô (${row},${col})`, en: `Scan cell (${row},${col})` },
        current: [row, col], codeLine: 9,
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "grid[row][col]", value: cell }],
        note: { vi: `Xét ô (${row},${col}) có giá trị ${cell}.`, en: `Inspect cell (${row},${col}) with value ${cell}.` },
      });

      const isFresh = cell === "1";
      pushStep({
        title: { vi: `grid[${row}][${col}] == 1 → ${isFresh}`, en: `grid[${row}][${col}] == 1 → ${isFresh}` },
        current: [row, col], codeLine: 10,
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "is fresh?", value: isFresh }],
        note: isFresh
          ? { vi: "Đây là cam tươi nên tăng fresh.", en: "This is a fresh orange, so increment fresh." }
          : { vi: "Không phải cam tươi; tiếp tục kiểm tra cam thối.", en: "It is not fresh; continue to the rotten-orange check." },
      });

      if (isFresh) {
        fresh++;
        pushStep({
          title: { vi: `fresh += 1 → ${fresh}`, en: `fresh += 1 → ${fresh}` },
          current: [row, col], codeLine: 11,
          vars: [{ name: "row", value: row }, { name: "col", value: col }],
          note: { vi: `Đã đếm ${fresh} cam tươi.`, en: `${fresh} fresh orange(s) counted so far.` },
        });
        continue;
      }

      const isRotten = cell === "2";
      pushStep({
        title: { vi: `grid[${row}][${col}] == 2 → ${isRotten}`, en: `grid[${row}][${col}] == 2 → ${isRotten}` },
        current: [row, col], codeLine: 12,
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "is rotten?", value: isRotten }],
        note: isRotten
          ? { vi: "Đây là cam thối ban đầu; thêm vào queue.", en: "This is an initially rotten orange; append it to the queue." }
          : { vi: "Đây là ô trống; không làm gì.", en: "This is an empty cell; do nothing." },
      });

      if (isRotten) {
        rottenAt[row][col] = 0;
        queue.push([row, col]);
        pushStep({
          title: { vi: `queue.append((${row},${col}))`, en: `queue.append((${row},${col}))` },
          current: [row, col], codeLine: 13,
          vars: [{ name: "row", value: row }, { name: "col", value: col }],
          note: { vi: `Queue nguồn BFS hiện là ${queueLabel()}.`, en: `The BFS source queue is now ${queueLabel()}.` },
        });
      }
    }
  }

  pushStep({
    title: { vi: `fresh == 0 → ${fresh === 0}`, en: `fresh == 0 → ${fresh === 0}` },
    codeLine: 14,
    vars: [{ name: "fresh == 0", value: fresh === 0 }],
    note: fresh === 0
      ? { vi: "Không có cam tươi; kết quả là 0 phút.", en: "There are no fresh oranges; the answer is 0 minutes." }
      : { vi: "Còn cam tươi nên cần chạy BFS.", en: "Fresh oranges remain, so BFS is required." },
  });

  if (fresh === 0) {
    pushStep({
      title: { vi: "return 0", en: "return 0" },
      codeLine: 15, final: true,
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Trả về 0 ngay.", en: "Return 0 immediately." },
    });
    return { original, answer: 0, steps };
  }

  minutes = 0;
  pushStep({
    title: { vi: "minutes = 0", en: "minutes = 0" },
    codeLine: 16,
    note: { vi: "Chưa có phút lan thối nào trôi qua.", en: "No spreading minute has elapsed yet." },
  });

  pushStep({
    title: { vi: "Khai báo 4 hướng", en: "Define four directions" },
    codeLine: 17,
    vars: [{ name: "directions", value: "down, up, right, left" }],
    note: { vi: "Mỗi cam thối chỉ lan theo 4 hướng.", en: "Rot spreads only in four directions." },
  });

  while (queue.length && fresh > 0) {
    pushStep({
      title: { vi: `while queue and fresh > 0 → True`, en: `while queue and fresh > 0 → True` },
      codeLine: 18,
      vars: [{ name: "condition", value: true }],
      note: { vi: "Queue còn nguồn lây và vẫn còn cam tươi.", en: "The queue has spreading sources and fresh oranges remain." },
    });

    const levelSize = queue.length;
    const rottedThisMinute = [];
    for (let index = 0; index < levelSize; index++) {
      pushStep({
        title: { vi: `Xử lý node ${index + 1}/${levelSize} của phút ${minutes + 1}`, en: `Process node ${index + 1}/${levelSize} for minute ${minutes + 1}` },
        codeLine: 19,
        vars: [{ name: "index", value: index }, { name: "level_size", value: levelSize }],
        note: { vi: "range(len(queue)) được chốt trước, nên chỉ xử lý frontier hiện tại.", en: "range(len(queue)) is fixed up front, so only the current frontier is processed." },
      });

      const [row, col] = queue.shift();
      pushStep({
        title: { vi: `popleft → (${row},${col})`, en: `popleft → (${row},${col})` },
        current: [row, col], codeLine: 20,
        vars: [{ name: "row", value: row }, { name: "col", value: col }],
        note: { vi: `Lấy cam thối (${row},${col}) khỏi đầu queue.`, en: `Remove rotten orange (${row},${col}) from the queue front.` },
      });

      for (const [deltaRow, deltaCol] of directions) {
        pushStep({
          title: { vi: `Thử hướng (${deltaRow},${deltaCol})`, en: `Try direction (${deltaRow},${deltaCol})` },
          current: [row, col], codeLine: 21,
          vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }, { name: "row", value: row }, { name: "col", value: col }],
          note: { vi: "Xét một trong bốn ô lân cận.", en: "Inspect one of the four neighboring cells." },
        });

        const nextRow = row + deltaRow;
        const nextCol = col + deltaCol;
        pushStep({
          title: { vi: `next = (${nextRow},${nextCol})`, en: `next = (${nextRow},${nextCol})` },
          current: [row, col], codeLine: 22,
          vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
          note: { vi: "Tính tọa độ ô kế tiếp.", en: "Compute the neighboring coordinates." },
        });

        const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
        const isFreshNeighbor = inBounds && grid[nextRow][nextCol] === "1";
        pushStep({
          title: { vi: `Ô (${nextRow},${nextCol}) hợp lệ và tươi → ${isFreshNeighbor}`, en: `Cell (${nextRow},${nextCol}) is valid and fresh → ${isFreshNeighbor}` },
          current: inBounds ? [nextRow, nextCol] : [row, col], codeLine: 23,
          vars: [{ name: "in bounds?", value: inBounds }, { name: "fresh neighbor?", value: isFreshNeighbor }],
          note: isFreshNeighbor
            ? { vi: "Điều kiện True; cam này sẽ bị thối.", en: "The condition is true; this orange will rot." }
            : { vi: "Điều kiện False; bỏ qua hướng này.", en: "The condition is false; skip this direction." },
        });
        if (!isFreshNeighbor) continue;

        grid[nextRow][nextCol] = "2";
        rottenAt[nextRow][nextCol] = minutes + 1;
        const newlyRotten = new Set([key(nextRow, nextCol)]);
        pushStep({
          title: { vi: `grid[${nextRow}][${nextCol}] = 2`, en: `grid[${nextRow}][${nextCol}] = 2` },
          current: [nextRow, nextCol], newlyRotten, codeLine: 24,
          vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
          note: { vi: `Đánh dấu cam tại (${nextRow},${nextCol}) là thối ở phút ${minutes + 1}.`, en: `Mark orange (${nextRow},${nextCol}) rotten at minute ${minutes + 1}.` },
        });

        fresh--;
        pushStep({
          title: { vi: `fresh -= 1 → ${fresh}`, en: `fresh -= 1 → ${fresh}` },
          current: [nextRow, nextCol], newlyRotten, codeLine: 25,
          vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
          note: { vi: `Còn ${fresh} cam tươi.`, en: `${fresh} fresh orange(s) remain.` },
        });

        queue.push([nextRow, nextCol]);
        rottedThisMinute.push([nextRow, nextCol]);
        pushStep({
          title: { vi: `queue.append((${nextRow},${nextCol}))`, en: `queue.append((${nextRow},${nextCol}))` },
          current: [nextRow, nextCol], newlyRotten, codeLine: 26,
          vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
          note: { vi: "Thêm cam vừa thối vào frontier của phút kế tiếp.", en: "Append the newly rotten orange to the next minute's frontier." },
        });
      }
    }

    minutes++;
    pushStep({
      title: { vi: `minutes += 1 → ${minutes}`, en: `minutes += 1 → ${minutes}` },
      codeLine: 27,
      vars: [{ name: "rotted this minute", value: rottedThisMinute.map(([row, col]) => `(${row},${col})`).join(", ") || "none" }],
      note: { vi: `Hoàn tất toàn bộ frontier của phút ${minutes}.`, en: `Finished processing the entire frontier for minute ${minutes}.` },
    });
  }

  pushStep({
    title: { vi: "Thoát vòng while", en: "Exit the while loop" },
    codeLine: 18,
    vars: [{ name: "condition", value: Boolean(queue.length && fresh > 0) }],
    note: fresh === 0
      ? { vi: "fresh = 0 nên BFS hoàn tất.", en: "fresh = 0, so BFS is complete." }
      : { vi: "Queue đã rỗng nhưng vẫn còn cam tươi.", en: "The queue is empty while fresh oranges remain." },
  });

  const answer = fresh === 0 ? minutes : -1;
  pushStep({
    title: answer === -1 ? { vi: "return -1", en: "return -1" } : { vi: `return ${minutes}`, en: `return ${minutes}` },
    codeLine: 28, final: true,
    vars: [{ name: "answer", value: answer }],
    note: answer === -1
      ? { vi: "Vẫn còn cam tươi không thể tiếp cận nên trả -1.", en: "Unreachable fresh oranges remain, so return -1." }
      : { vi: `Tất cả cam đã thối sau ${minutes} phút.`, en: `All oranges are rotten after ${minutes} minute(s).` },
  });

  return { original, answer, steps };
}

/**
 * LeetCode 1730: Shortest Path to Get Food.
 * Single-source BFS (4 directions) from the '*' cell to the nearest '#' cell.
 * 'X' blocks movement, 'O' is free space. Path length counts MOVES (edges),
 * unlike 1091 where the start cell itself counts as distance 1.
 */
function buildSteps1730(input) {
  const grid = parseIslandGrid(input);
  const steps = [];

  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const validCell = (v) => v === "*" || v === "#" || v === "O" || v === "X";
  const invalid = !rows || !cols || grid.some((row) => row.length !== cols || row.some((v) => !validCell(v)));

  if (invalid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [4, 5],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid chỉ được gồm '*' (vị trí bắt đầu, đúng 1 ô), '#' (thức ăn), 'O' (đi được), 'X' (vật cản). Ví dụ: XXXXXX|X*OOOX|XOO#OX|XXXXXX.",
        en: "Grid may only contain '*' (start, exactly one cell), '#' (food), 'O' (free space), 'X' (obstacle). Example: XXXXXX|X*OOOX|XOO#OX|XXXXXX.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  let start = null;
  const foodCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "*") start = [r, c];
      if (grid[r][c] === "#") foodCells.push([r, c]);
    }
  }

  if (!start) {
    steps.push({
      title: { vi: "Không có ô '*' → không hợp lệ", en: "No '*' cell → invalid" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [4, 5],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid phải có đúng 1 ô '*' làm vị trí bắt đầu.",
        en: "The grid must contain exactly one '*' start cell.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const queued = new Set();
  const key = (r, c) => `${r},${c}`;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  function makeCells(current = null, pathCells = new Set()) {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        const cellKey = key(r, c);
        let cls = "empty";
        let label = ".";
        if (cell === "X") { cls = "wall"; label = "X"; }
        else if (cell === "*" && !(current && current[0] === r && current[1] === c)) { cls = dist[r][c] >= 0 ? "visited" : "start"; label = "*"; }
        else if (cell === "#") { cls = "end"; label = "#"; }
        if (dist[r][c] >= 0 && cell !== "#" && cell !== "*") { cls = "visited"; label = String(dist[r][c]); }
        if (queued.has(cellKey)) cls = "queued";
        if (pathCells.has(cellKey)) cls = cell === "#" ? "end" : cell === "*" ? "start" : "path";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current = null, pathCells, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(current, pathCells) },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Tìm ô '*' bằng cách quét grid", en: "Find the '*' cell by scanning the grid" },
    current: start,
    codeLines: [6, 7, 8, 9, 10],
    vars: [
      { name: "start", value: `(${start[0]}, ${start[1]})` },
      { name: "food cells", value: foodCells.map(([r, c]) => `(${r},${c})`).join(", ") || "none" },
    ],
    note: {
      vi: "Quét toàn bộ grid để tìm ô '*' — vị trí bắt đầu. BFS sẽ mở rộng từ đây theo 4 hướng (lên/xuống/trái/phải), chỉ đi qua ô 'O' hoặc '#', không qua 'X'.",
      en: "Scan the whole grid to find the '*' cell — the starting position. BFS will expand from here in 4 directions (up/down/left/right), moving only through 'O' or '#' cells, never 'X'.",
    },
  });

  pushStep({
    title: { vi: "dirs, visited, queue = deque([(start, 0)])", en: "dirs, visited, queue = deque([(start, 0)])" },
    current: start,
    codeLines: [13, 14, 15],
    vars: [
      { name: "dirs", value: "[(-1,0), (1,0), (0,-1), (0,1)]" },
      { name: "visited", value: `{(${start[0]},${start[1]})}` },
      { name: "queue", value: `[(${start[0]}, ${start[1]}, 0)]` },
    ],
    note: {
      vi: `Khởi tạo BFS: dist(start) = 0 vì khoảng cách tính theo SỐ BƯỚC DI CHUYỂN, không phải số ô (khác bài 1091).`,
      en: `Initialize BFS: dist(start) = 0 because distance is counted by NUMBER OF MOVES, not number of cells (unlike problem 1091).`,
    },
  });

  dist[start[0]][start[1]] = 0;
  queued.add(key(start[0], start[1]));
  let queue = [start];
  let foundCell = null;

  while (queue.length && !foundCell) {
    const next = [];
    for (const [r, c] of queue) {
      queued.delete(key(r, c));

      const isFoodHere = grid[r][c] === "#";
      pushStep({
        title: { vi: `popleft() → (${r},${c},${dist[r][c]}); if grid[r][c]=='#' → ${isFoodHere}`, en: `popleft() → (${r},${c},${dist[r][c]}); if grid[r][c]=='#' → ${isFoodHere}` },
        current: [r, c],
        codeLines: [17, 18],
        vars: [
          { name: "cell", value: `(${r}, ${c})` },
          { name: "dist", value: dist[r][c] },
        ],
        note: isFoodHere
          ? { vi: `(${r},${c}) là ô '#' → tìm thấy thức ăn! Đây chính là dist = ${dist[r][c]} ngắn nhất.`, en: `(${r},${c}) is a '#' cell → food found! This is the shortest dist = ${dist[r][c]}.` }
          : { vi: `(${r},${c}) chưa phải ô '#'. Thử 4 hướng xung quanh: ô hợp lệ phải trong biên, không phải 'X', và chưa thăm.`, en: `(${r},${c}) is not a '#' cell yet. Try the 4 surrounding directions: a valid neighbor must be in bounds, not 'X', and unvisited.` },
      });

      if (isFoodHere) {
        foundCell = [r, c];
        break;
      }

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (grid[nr][nc] === "X" || dist[nr][nc] !== -1) continue;

        dist[nr][nc] = dist[r][c] + 1;
        parent[nr][nc] = [r, c];
        next.push([nr, nc]);
        queued.add(key(nr, nc));

        pushStep({
          title: { vi: `visited.add((${nr},${nc})); queue.append((${nr},${nc},${dist[nr][nc]}))`, en: `visited.add((${nr},${nc})); queue.append((${nr},${nc},${dist[nr][nc]}))` },
          current: [nr, nc],
          codeLines: [20, 21, 22, 23, 24],
          vars: [
            { name: "from", value: `(${r}, ${c})` },
            { name: "neighbor", value: `(${nr}, ${nc})` },
            { name: "dist[neighbor]", value: dist[nr][nc] },
          ],
          note: {
            vi: `(${nr},${nc}) chưa thăm và không phải 'X' → thêm vào visited và queue với dist = ${dist[r][c]} + 1 = ${dist[nr][nc]}.`,
            en: `(${nr},${nc}) is unvisited and not 'X' → add to visited and queue with dist = ${dist[r][c]} + 1 = ${dist[nr][nc]}.`,
          },
        });
      }
    }
    queue = next;
  }

  const answer = foundCell ? dist[foundCell[0]][foundCell[1]] : -1;
  const pathCells = new Set();
  if (foundCell) {
    let cur = foundCell;
    while (cur) {
      pathCells.add(key(cur[0], cur[1]));
      cur = parent[cur[0]][cur[1]];
    }
  }

  pushStep({
    title: answer === -1
      ? { vi: "return -1 (hết queue, không tới được thức ăn)", en: "return -1 (queue empty, food unreachable)" }
      : { vi: `return dist → ${answer}`, en: `return dist → ${answer}` },
    current: foundCell,
    pathCells,
    final: true,
    codeLines: answer === -1 ? [25] : [19],
    vars: [
      { name: "answer", value: answer },
    ],
    note: answer === -1
      ? { vi: "BFS đã hết queue nhưng không chạm được ô '#' nào, nên không có đường tới thức ăn.", en: "BFS exhausted the queue without reaching any '#' cell, so there is no path to food." }
      : { vi: `BFS chạm tới ô thức ăn lần đầu với dist = ${answer} bước di chuyển. Vì BFS mở rộng theo từng level, đây là kết quả ngắn nhất. Đường đi được tô xanh.`, en: `BFS first reached a food cell with dist = ${answer} moves. Because BFS expands level by level, this is the shortest result. The path is highlighted.` },
  });

  return { original: grid, answer, steps };
}

/**
 * LeetCode 1730 Approach 2: level-based BFS.
 * Queue only stores (r, c) — no distance tag per element. Instead, all cells
 * currently in the queue belong to the same "level" (distance), snapshotted
 * via size = len(queue) before the inner loop mutates the queue. distance is
 * a single shared counter incremented once per fully-processed level.
 * Food is detected when checking a NEIGHBOR (before enqueueing it), not when
 * popping it — unlike Approach 1 which checks the popped cell itself.
 */
function buildSteps1730v2(input) {
  const grid = parseIslandGrid(input);
  const steps = [];

  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const validCell = (v) => v === "*" || v === "#" || v === "O" || v === "X";
  const invalid = !rows || !cols || grid.some((row) => row.length !== cols || row.some((v) => !validCell(v)));

  if (invalid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeBlock: 2,
      codeLines: [5, 6],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid chỉ được gồm '*' (vị trí bắt đầu, đúng 1 ô), '#' (thức ăn), 'O' (đi được), 'X' (vật cản). Ví dụ: XXXXXX|X*OOOX|XOO#OX|XXXXXX.",
        en: "Grid may only contain '*' (start, exactly one cell), '#' (food), 'O' (free space), 'X' (obstacle). Example: XXXXXX|X*OOOX|XOO#OX|XXXXXX.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  let start = null;
  for (let r = 0; r < rows && !start; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "*") { start = [r, c]; break; }
    }
  }

  if (!start) {
    steps.push({
      title: { vi: "Không có ô '*' → không hợp lệ", en: "No '*' cell → invalid" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeBlock: 2,
      codeLines: [5, 6],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid phải có đúng 1 ô '*' làm vị trí bắt đầu.",
        en: "The grid must contain exactly one '*' start cell.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  // level[r][c] = distance (in moves) at which the cell was reached, or -1 if unvisited.
  const level = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const key = (r, c) => `${r},${c}`;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  function makeCells(currentSet, foundCellNow) {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        const isCurrent = currentSet && currentSet.has(key(r, c));
        const isFound = foundCellNow && foundCellNow[0] === r && foundCellNow[1] === c;
        let cls = "empty";
        let label = ".";
        if (cell === "X") { cls = "wall"; label = "X"; }
        else if (cell === "*") { cls = level[r][c] >= 0 ? "visited" : "start"; label = "*"; }
        else if (cell === "#") { cls = "end"; label = "#"; }
        if (level[r][c] >= 0 && cell !== "*") { cls = "visited"; label = String(level[r][c]); }
        if (isCurrent) cls = "queued";
        if (isFound) cls = cell === "#" ? "end" : "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, currentSet, foundCellNow, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(currentSet, foundCellNow) },
      highlight: [],
      mark: [],
      final,
      codeBlock: 2,
      codeLines,
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "for i,j: tìm ô '*' → queue, visited", en: "for i,j: find '*' cell → queue, visited" },
    currentSet: new Set([key(start[0], start[1])]),
    codeLines: [7, 8, 9, 10, 11, 12],
    vars: [{ name: "start", value: `(${start[0]}, ${start[1]})` }],
    note: {
      vi: "Quét grid tìm ô '*', đưa vào queue và visited. Chỉ lưu (i,j), KHÔNG kèm khoảng cách — khác Cách 1 vốn lưu (r,c,dist) trong mỗi phần tử queue.",
      en: "Scan the grid for the '*' cell, add it to queue and visited. Only (i,j) is stored — NO distance tag — unlike Approach 1 which stores (r,c,dist) per element.",
    },
  });

  level[start[0]][start[1]] = 0;
  let queue = [start];
  const visited = new Set([key(start[0], start[1])]);
  let distance = 1;
  let foundCell = null;
  let foundDist = -1;

  pushStep({
    title: { vi: "directions = [...]; distance = 1", en: "directions = [...]; distance = 1" },
    currentSet: new Set([key(start[0], start[1])]),
    codeLines: [13, 14],
    vars: [
      { name: "directions", value: "[(0,1),(1,0),(0,-1),(-1,0)]" },
      { name: "distance", value: distance },
    ],
    note: {
      vi: "distance là biến ĐẾM CHUNG cho cả level hiện tại (khác Cách 1, nơi mỗi phần tử trong queue tự mang dist riêng). distance bắt đầu từ 1 vì đây là khoảng cách của LEVEL KẾ TIẾP (các hàng xóm của '*').",
      en: "distance is a SHARED counter for the whole current level (unlike Approach 1, where each queue element carries its own dist). distance starts at 1 because it represents the NEXT level's distance (the neighbors of '*').",
    },
  });

  while (queue.length && !foundCell) {
    // Line 21: while queue:
    pushStep({
      title: { vi: `while queue → True (size=${queue.length}, distance=${distance})`, en: `while queue → True (size=${queue.length}, distance=${distance})` },
      currentSet: new Set(queue.map(([r, c]) => key(r, c))),
      codeLines: [15],
      vars: [{ name: "queue", value: `[${queue.map(([r, c]) => `(${r},${c})`).join(", ")}]` }, { name: "distance", value: distance }],
      note: {
        vi: `queue không rỗng → còn 1 level cần xử lý. Tất cả ${queue.length} ô trong queue hiện tại đều ở cùng khoảng cách distance-1 = ${distance - 1} (đã thăm ở lượt trước).`,
        en: `queue is not empty → there is still a level to process. All ${queue.length} cells in the current queue share the same distance-1 = ${distance - 1} (visited on the previous round).`,
      },
    });

    // Line 22: size = len(queue)
    const size = queue.length;
    pushStep({
      title: { vi: `size = len(queue) = ${size}`, en: `size = len(queue) = ${size}` },
      currentSet: new Set(queue.map(([r, c]) => key(r, c))),
      codeLines: [16],
      vars: [{ name: "size", value: size }],
      note: {
        vi: `size = ${size} — CHỐT số ô của level này TRƯỚC KHI vòng lặp for thêm ô của level kế tiếp vào queue. Đây là kỹ thuật kinh điển để BFS theo từng "lớp".`,
        en: `size = ${size} — LOCK IN the number of cells in this level BEFORE the for-loop appends next-level cells into the queue. This is the classic technique for level-by-level BFS.`,
      },
    });

    for (let k = 0; k < size && !foundCell; k++) {
      // Line 23: for _ in range(size):
      pushStep({
        title: { vi: `for _=${k} (range(${size}))`, en: `for _=${k} (range(${size}))` },
        currentSet: new Set(queue.map(([r, c]) => key(r, c))),
        codeLines: [17],
        vars: [{ name: "iteration", value: `${k + 1}/${size}` }],
        note: {
          vi: `Vòng lặp thứ ${k + 1}/${size} để xử lý đúng ${size} ô của level này.`,
          en: `Iteration ${k + 1}/${size} to process exactly ${size} cells of this level.`,
        },
      });

      // Line 24: i, j = queue.popleft()
      const [i, j] = queue.shift();
      pushStep({
        title: { vi: `i, j = queue.popleft() → (${i},${j})`, en: `i, j = queue.popleft() → (${i},${j})` },
        currentSet: new Set([key(i, j)]),
        codeLines: [18],
        vars: [{ name: "i,j", value: `(${i}, ${j})` }],
        note: {
          vi: `Lấy (${i},${j}) ra khỏi đầu queue để xét 4 hàng xóm.`,
          en: `Pop (${i},${j}) from the front of the queue to check its 4 neighbors.`,
        },
      });

      for (const [dx, dy] of dirs) {
        // Line 25: for dx, dy in directions:
        pushStep({
          title: { vi: `for dx,dy in directions → (${dx},${dy})`, en: `for dx,dy in directions → (${dx},${dy})` },
          currentSet: new Set([key(i, j)]),
          codeLines: [19],
          vars: [{ name: "dx,dy", value: `(${dx}, ${dy})` }],
          note: {
            vi: `Thử hướng (${dx},${dy}) từ (${i},${j}).`,
            en: `Try direction (${dx},${dy}) from (${i},${j}).`,
          },
        });

        // Lines 26-27: x = i+dx; y = j+dy
        const x = i + dx, y = j + dy;
        pushStep({
          title: { vi: `x, y = ${i}+${dx}, ${j}+${dy} = (${x},${y})`, en: `x, y = ${i}+${dx}, ${j}+${dy} = (${x},${y})` },
          currentSet: new Set([key(i, j)]),
          codeLines: [20, 21],
          vars: [{ name: "x,y", value: `(${x}, ${y})` }],
          note: {
            vi: `Tọa độ hàng xóm cần xét: (${x},${y}).`,
            en: `Neighbor coordinate to check: (${x},${y}).`,
          },
        });

        // Line 28: out of bounds or 'X' -> continue
        const outOrWall = x < 0 || x >= rows || y < 0 || y >= cols || grid[x][y] === "X";
        pushStep({
          title: { vi: `if out-of-bounds or grid=='X' → ${outOrWall}`, en: `if out-of-bounds or grid=='X' → ${outOrWall}` },
          currentSet: new Set([key(i, j)]),
          codeLines: [22, 23],
          note: outOrWall
            ? { vi: `(${x},${y}) ngoài biên hoặc là 'X' → continue, bỏ qua hướng này.`, en: `(${x},${y}) is out of bounds or is 'X' → continue, skip this direction.` }
            : { vi: `(${x},${y}) hợp lệ, không phải 'X' → tiếp tục kiểm tra.`, en: `(${x},${y}) is valid and not 'X' → keep checking.` },
        });
        if (outOrWall) continue;

        // Line 29: if grid[x][y] == '#': return distance
        const isFood = grid[x][y] === "#";
        pushStep({
          title: { vi: `if grid[${x}][${y}] == '#' → ${isFood}`, en: `if grid[${x}][${y}] == '#' → ${isFood}` },
          currentSet: new Set([key(i, j), key(x, y)]),
          codeLines: [24],
          vars: [{ name: "grid[x][y]", value: grid[x][y] }],
          note: isFood
            ? { vi: `(${x},${y}) là ô '#' → TÌM THẤY thức ăn! distance = ${distance} chính là đáp án ngắn nhất.`, en: `(${x},${y}) is a '#' cell → FOOD FOUND! distance = ${distance} is the shortest answer.` }
            : { vi: `(${x},${y}) chưa phải ô '#'.`, en: `(${x},${y}) is not a '#' cell yet.` },
        });

        if (isFood) {
          parent[x][y] = [i, j];
          foundCell = [x, y];
          foundDist = distance;
          pushStep({
            title: { vi: `return distance → ${distance}`, en: `return distance → ${distance}` },
            currentSet: new Set([key(x, y)]),
            foundCellNow: [x, y],
            codeLines: [25],
            vars: [{ name: "answer", value: distance }],
            note: {
              vi: `Trả về distance = ${distance} ngay lập tức — đây là khoảng cách ngắn nhất tới thức ăn.`,
              en: `Return distance = ${distance} immediately — this is the shortest distance to food.`,
            },
          });
          break;
        }

        // Line 31: if (x, y) not in visited:
        const notVisited = !visited.has(key(x, y));
        pushStep({
          title: { vi: `if (${x},${y}) not in visited → ${notVisited}`, en: `if (${x},${y}) not in visited → ${notVisited}` },
          currentSet: new Set([key(i, j), key(x, y)]),
          codeLines: [26],
          note: notVisited
            ? { vi: `(${x},${y}) chưa thăm → sẽ thêm vào visited và queue.`, en: `(${x},${y}) not visited yet → will be added to visited and queue.` }
            : { vi: `(${x},${y}) đã thăm rồi → bỏ qua.`, en: `(${x},${y}) already visited → skip.` },
        });

        if (notVisited) {
          // Lines 32-33: visited.add((x,y)); queue.append((x,y))
          visited.add(key(x, y));
          level[x][y] = distance;
          parent[x][y] = [i, j];
          queue.push([x, y]);
          pushStep({
            title: { vi: `visited.add((${x},${y})); queue.append((${x},${y}))`, en: `visited.add((${x},${y})); queue.append((${x},${y}))` },
            currentSet: new Set([key(x, y)]),
            codeLines: [27, 28],
            vars: [{ name: "queue", value: `[${queue.map(([r, c]) => `(${r},${c})`).join(", ")}]` }],
            note: {
              vi: `Đánh dấu (${x},${y}) đã thăm và thêm vào queue. Ô này sẽ được xử lý ở level distance=${distance}.`,
              en: `Mark (${x},${y}) visited and add it to the queue. This cell will be processed at level distance=${distance}.`,
            },
          });
        }
      }
      if (foundCell) break;
    }

    if (!foundCell) {
      // Line 34: distance += 1
      distance++;
      pushStep({
        title: { vi: `distance += 1 → ${distance}`, en: `distance += 1 → ${distance}` },
        currentSet: new Set(queue.map(([r, c]) => key(r, c))),
        codeLines: [29],
        vars: [{ name: "distance", value: distance }],
        note: {
          vi: `Đã xử lý xong toàn bộ level trước. Level kế tiếp (các ô mới trong queue) sẽ có khoảng cách distance = ${distance}.`,
          en: `Finished processing the previous level entirely. The next level (new cells in the queue) will have distance = ${distance}.`,
        },
      });
    }
  }

  const answer = foundCell ? foundDist : -1;
  const pathCells = new Set();
  if (foundCell) {
    let cur = foundCell;
    while (cur) {
      pathCells.add(key(cur[0], cur[1]));
      cur = parent[cur[0]][cur[1]];
    }
  }

  const fs = {
    title: answer === -1
      ? { vi: "return -1 (hết queue, không tới được thức ăn)", en: "return -1 (queue empty, food unreachable)" }
      : { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [],
    bfsGrid: {
      rows, cols,
      cells: grid.map((row, r) => row.map((cell, c) => {
        let cls = "empty";
        let label = ".";
        if (cell === "X") { cls = "wall"; label = "X"; }
        else if (cell === "*") { cls = "start"; label = "*"; }
        else if (cell === "#") { cls = "end"; label = "#"; }
        if (level[r][c] >= 0 && cell !== "*") { cls = "visited"; label = String(level[r][c]); }
        if (pathCells.has(key(r, c))) cls = cell === "#" ? "end" : cell === "*" ? "start" : "path";
        return { label, cls };
      })),
    },
    highlight: [],
    mark: [],
    codeBlock: 2,
    codeLines: answer === -1 ? [30] : [25],
    vars: [{ name: "answer", value: answer }],
    note: answer === -1
      ? { vi: "BFS đã hết queue mà chưa gặp ô '#' nào → không có đường tới thức ăn.", en: "BFS exhausted the queue without meeting any '#' cell → no path to food." }
      : { vi: `BFS theo level tới thức ăn với distance = ${answer}. Đường đi được tô xanh.`, en: `Level-based BFS reached food with distance = ${answer}. The path is highlighted.` },
  };
  fs.final = true;
  steps.push(fs);

  return { original: grid, answer, steps };
}

/**
 * LeetCode 1091: Shortest Path in Binary Matrix.
 * BFS in 8 directions. Path length counts cells, so the start cell has distance 1.
 */
function buildSteps1091(input) {
  const grid = parseIslandGrid(input).map((row) => row.map((v) => Number(v)));
  const steps = [];

  if (!grid.length || grid.length !== grid[0].length || grid.some((row) => row.length !== grid.length || row.some((v) => v !== 0 && v !== 1))) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [4, 5],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid phải là ma trận vuông chỉ gồm 0/1. Ví dụ: 011|101|110 hoặc 0,1,1|1,0,1|1,1,0.",
        en: "Grid must be a square matrix containing only 0/1. Example: 011|101|110 or 0,1,1|1,0,1|1,1,0.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  const n = grid.length;
  const dist = Array.from({ length: n }, () => Array(n).fill(0));
  const parent = Array.from({ length: n }, () => Array(n).fill(null));
  const queued = new Set();
  const key = (r, c) => `${r},${c}`;
  const dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  function makeCells(current = null, pathCells = new Set()) {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        const cellKey = key(r, c);
        let cls = cell === 1 ? "wall" : "empty";
        let label = cell === 1 ? "1" : ".";
        if (dist[r][c] > 0) {
          cls = "visited";
          label = String(dist[r][c]);
        }
        if (queued.has(cellKey)) cls = "queued";
        if (pathCells.has(cellKey)) cls = "path";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current = null, pathCells, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows: n, cols: n, cells: makeCells(current, pathCells) },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Khởi tạo BFS 8 hướng", en: "Initialize 8-direction BFS" },
    codeLines: [4, 5, 6, 7, 8, 9],
    vars: [
      { name: "n", value: n },
      { name: "start", value: "(0, 0)" },
      { name: "target", value: `(${n - 1}, ${n - 1})` },
    ],
    note: {
      vi: "Đường đi chỉ được qua ô 0 và có thể đi 8 hướng, gồm cả đường chéo. Độ dài đường đi tính cả ô bắt đầu và ô kết thúc.",
      en: "The path may only use 0-cells and can move in 8 directions, including diagonals. Path length counts both start and target cells.",
    },
  });

  if (grid[0][0] !== 0 || grid[n - 1][n - 1] !== 0) {
    pushStep({
      title: { vi: "Start hoặc target bị chặn → -1", en: "Start or target is blocked → -1" },
      current: grid[0][0] !== 0 ? [0, 0] : [n - 1, n - 1],
      final: true,
      codeLines: [5, 6],
      vars: [
        { name: "grid[0][0]", value: grid[0][0] },
        { name: `grid[${n - 1}][${n - 1}]`, value: grid[n - 1][n - 1] },
        { name: "answer", value: -1 },
      ],
      note: {
        vi: "Nếu ô đầu hoặc ô cuối là 1, không thể có clear path.",
        en: "If either endpoint is 1, no clear path can exist.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  dist[0][0] = 1;
  queued.add(key(0, 0));
  let queue = [[0, 0]];
  let found = n === 1;

  pushStep({
    title: { vi: "Đưa (0,0) vào queue", en: "Enqueue (0,0)" },
    current: [0, 0],
    codeLines: [8, 9],
    vars: [
      { name: "dist[0][0]", value: 1 },
      { name: "queue", value: "[(0, 0)]" },
    ],
    note: {
      vi: "BFS bắt đầu tại (0,0) với khoảng cách 1 vì độ dài path tính theo số ô.",
      en: "BFS starts at (0,0) with distance 1 because the path length counts cells.",
    },
  });

  while (queue.length && !found) {
    const next = [];
    for (const [r, c] of queue) {
      queued.delete(key(r, c));

      pushStep({
        title: { vi: `Xử lý ô (${r},${c})`, en: `Process cell (${r},${c})` },
        current: [r, c],
        codeLines: [10, 11, 12],
        vars: [
          { name: "cell", value: `(${r}, ${c})` },
          { name: "dist", value: dist[r][c] },
          { name: "queue level size", value: queue.length },
        ],
        note: {
          vi: `Từ (${r},${c}), thử 8 hướng xung quanh. Ô hợp lệ phải nằm trong biên, là 0, và chưa được thăm.`,
          en: `From (${r},${c}), try all 8 surrounding directions. A valid neighbor must be in bounds, be 0, and be unvisited.`,
        },
      });

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
        if (grid[nr][nc] !== 0 || dist[nr][nc] !== 0) continue;

        dist[nr][nc] = dist[r][c] + 1;
        parent[nr][nc] = [r, c];
        next.push([nr, nc]);
        queued.add(key(nr, nc));

        pushStep({
          title: { vi: `Thêm (${nr},${nc}) với dist = ${dist[nr][nc]}`, en: `Enqueue (${nr},${nc}) with dist = ${dist[nr][nc]}` },
          current: [nr, nc],
          codeLines: [13, 14, 15, 16, 17],
          vars: [
            { name: "from", value: `(${r}, ${c})` },
            { name: "neighbor", value: `(${nr}, ${nc})` },
            { name: "dist[neighbor]", value: dist[nr][nc] },
          ],
          note: {
            vi: `(${nr},${nc}) là ô 0 chưa thăm, nên gán dist = ${dist[r][c]} + 1 và lưu parent để truy vết đường đi.`,
            en: `(${nr},${nc}) is an unvisited 0-cell, so set dist = ${dist[r][c]} + 1 and store its parent for path tracing.`,
          },
        });

        if (nr === n - 1 && nc === n - 1) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    queue = next;
  }

  const answer = dist[n - 1][n - 1] || -1;
  const pathCells = new Set();
  if (answer !== -1) {
    let cur = [n - 1, n - 1];
    while (cur) {
      pathCells.add(key(cur[0], cur[1]));
      cur = parent[cur[0]][cur[1]];
    }
  }

  pushStep({
    title: answer === -1
      ? { vi: "Không tìm thấy clear path → -1", en: "No clear path found → -1" }
      : { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    current: [n - 1, n - 1],
    pathCells,
    final: true,
    codeLines: [18, 19],
    vars: [
      { name: "answer", value: answer },
      { name: "target dist", value: dist[n - 1][n - 1] || "unreached" },
    ],
    note: {
      vi: answer === -1
        ? "BFS đã hết queue nhưng chưa tới ô cuối, nên không tồn tại clear path."
        : `BFS tới target lần đầu với dist = ${answer}. Vì BFS theo từng level, đây là đường ngắn nhất. Đường đi được tô xanh.`,
      en: answer === -1
        ? "BFS exhausted the queue without reaching the target, so no clear path exists."
        : `BFS first reached the target with dist = ${answer}. Because BFS expands level by level, this is shortest. The path is highlighted.`,
    },
  });

  return { original: grid, answer, steps };
}

/**
 * LeetCode 3286: Find a Safe Walk Through a Grid.
 * BFS over states, keeping the best remaining health seen for each cell.
 */
function buildSteps3286(input, params) {
  const grid = parseBinaryGrid(input);
  const health = Number(params.health || 0);
  const steps = [];

  if (!grid.length || !grid[0].length || grid.some((row) => row.length !== grid[0].length || row.some((v) => v !== 0 && v !== 1))) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [4, 5],
      vars: [{ name: "answer", value: false }],
      note: {
        vi: "Lưới phải gồm các hàng cách bởi '|', mỗi ô là 0 hoặc 1. Ví dụ: 1,0,0|0,1,0|0,0,0.",
        en: "Grid must use rows separated by '|', each cell 0 or 1. Example: 1,0,0|0,1,0|0,0,0.",
      },
    });
    return { original: grid, answer: false, steps };
  }

  const m = grid.length;
  const n = grid[0].length;
  const best = Array.from({ length: m }, () => Array(n).fill(-1));
  const queued = new Set();
  const parents = new Map();
  const key = (r, c, h) => `${r},${c},${h}`;
  const cellKey = (r, c) => `${r},${c}`;

  function makeCells(current, pathCells) {
    const path = new Set((pathCells || []).map(([r, c]) => cellKey(r, c)));
    return grid.map((row, r) =>
      row.map((cost, c) => {
        let cls = cost === 1 ? "wall" : "empty";
        if (best[r][c] >= 0) cls = "visited";
        if (queued.has(cellKey(r, c))) cls = "queued";
        if (path.has(cellKey(r, c))) cls = "path";
        if (r === 0 && c === 0) cls = "start";
        if (r === m - 1 && c === n - 1) cls = "end";
        if (current && current[0] === r && current[1] === c) cls = "current";
        const label = best[r][c] >= 0 ? String(best[r][c]) : String(cost);
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current, codeLines, vars, note, final = false, pathCells = [] }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows: m, cols: n, cells: makeCells(current, pathCells) },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  const startHealth = health - grid[0][0];
  if (startHealth <= 0) {
    best[0][0] = Math.max(startHealth, 0);
    pushStep({
      title: { vi: "Không đủ máu để bắt đầu", en: "Not enough health to start" },
      current: [0, 0],
      final: true,
      codeLines: [6, 7],
      vars: [
        { name: "health", value: health },
        { name: "grid[0][0]", value: grid[0][0] },
        { name: "remaining", value: startHealth },
        { name: "answer", value: false },
      ],
      note: {
        vi: `Sau khi vào ô bắt đầu còn ${startHealth} máu. Cần máu > 0, nên không có đường an toàn.`,
        en: `After entering the start cell, remaining health is ${startHealth}. Health must stay > 0, so no safe walk exists.`,
      },
    });
    return { original: grid, health, answer: false, steps };
  }

  best[0][0] = startHealth;
  const queue = [[0, 0, startHealth]];
  queued.add(cellKey(0, 0));
  pushStep({
    title: { vi: "Khởi tạo BFS", en: "Initialize BFS" },
    current: [0, 0],
    codeLines: [6, 8, 9, 10],
    vars: [
      { name: "health", value: health },
      { name: "start remaining", value: startHealth },
      { name: "queue", value: "[(0,0)]" },
    ],
    note: {
      vi: `Trừ chi phí ô bắt đầu (${grid[0][0]}). Còn ${startHealth} máu. Mỗi ô hiển thị máu tốt nhất còn lại khi tới ô đó.`,
      en: `Subtract the start cell cost (${grid[0][0]}). Remaining health is ${startHealth}. Each cell shows the best remaining health seen there.`,
    },
  });

  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let head = 0;
  let answer = false;
  let finalState = null;

  while (head < queue.length && steps.length < 80) {
    const [r, c, curHealth] = queue[head++];
    queued.delete(cellKey(r, c));

    pushStep({
      title: { vi: `Xử lý ô (${r},${c})`, en: `Process cell (${r},${c})` },
      current: [r, c],
      codeLines: [11, 12, 13],
      vars: [
        { name: "cell", value: `(${r}, ${c})` },
        { name: "remaining health", value: curHealth },
        { name: "queue size", value: queue.length - head },
      ],
      note: {
        vi: `Pop (${r},${c}) với ${curHealth} máu còn lại. Thử đi 4 hướng.`,
        en: `Pop (${r},${c}) with ${curHealth} health remaining. Try all 4 directions.`,
      },
    });

    if (r === m - 1 && c === n - 1) {
      answer = true;
      finalState = [r, c, curHealth];
      break;
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;

      const nextHealth = curHealth - grid[nr][nc];
      if (nextHealth <= 0 || nextHealth <= best[nr][nc]) continue;

      best[nr][nc] = nextHealth;
      parents.set(key(nr, nc, nextHealth), key(r, c, curHealth));
      queue.push([nr, nc, nextHealth]);
      queued.add(cellKey(nr, nc));

      pushStep({
        title: { vi: `Thêm (${nr},${nc}) vào queue`, en: `Enqueue (${nr},${nc})` },
        current: [nr, nc],
        codeLines: [14, 15, 16, 17, 18, 19],
        vars: [
          { name: "from", value: `(${r}, ${c})` },
          { name: "to", value: `(${nr}, ${nc})` },
          { name: "cell cost", value: grid[nr][nc] },
          { name: "new health", value: nextHealth },
        ],
        note: {
          vi: `Đi tới (${nr},${nc}) tốn ${grid[nr][nc]} máu, còn ${nextHealth}. Đây là lượng máu tốt nhất từng thấy ở ô này.`,
          en: `Move to (${nr},${nc}) costs ${grid[nr][nc]} health, leaving ${nextHealth}. This is the best health seen for this cell.`,
        },
      });
    }
  }

  if (answer && finalState) {
    const pathCells = [];
    let cur = key(finalState[0], finalState[1], finalState[2]);
    while (cur) {
      const [r, c] = cur.split(",").map(Number);
      pathCells.push([r, c]);
      cur = parents.get(cur);
    }
    pathCells.reverse();

    pushStep({
      title: { vi: "Tìm thấy đường an toàn", en: "Safe walk found" },
      current: [m - 1, n - 1],
      pathCells,
      final: true,
      codeLines: [12, 13],
      vars: [
        { name: "answer", value: true },
        { name: "finish health", value: finalState[2] },
        { name: "path length", value: pathCells.length },
      ],
      note: {
        vi: `Đã tới đích với ${finalState[2]} máu còn lại (> 0), nên trả về True.`,
        en: `Reached the destination with ${finalState[2]} health remaining (> 0), so return True.`,
      },
    });
  } else {
    pushStep({
      title: { vi: "Không tìm thấy đường an toàn", en: "No safe walk found" },
      current: null,
      final: true,
      codeLines: [20],
      vars: [
        { name: "answer", value: false },
        { name: "visited cells", value: best.flat().filter((v) => v >= 0).length },
      ],
      note: {
        vi: "Queue rỗng: mọi đường có thể đi đều hết máu hoặc không cải thiện lượng máu đã biết. Trả về False.",
        en: "Queue is empty: every possible route runs out of health or does not improve the best known health. Return False.",
      },
    });
  }

  return { original: grid, health, answer, steps };
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
  const edgesRaw = String(input).split(",").map((edge) => edge.trim()).filter(Boolean);
  const n = Number(params.n);
  const k = Number(params.k);
  const steps = [];
  const edgeList = edgesRaw.map((e) => {
    const parts = e.split("-").map(Number);
    return { u: parts[0], v: parts[1], w: parts[2] };
  });
  const valid = Number.isInteger(n) && n > 0
    && Number.isInteger(k) && k >= 1 && k <= n
    && edgeList.length > 0
    && edgeList.every(({ u, v, w }) => (
      Number.isInteger(u) && u >= 1 && u <= n
      && Number.isInteger(v) && v >= 1 && v <= n
      && u !== v && Number.isFinite(w) && w >= 0
    ));

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [5],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Nhập cạnh theo dạng u-v-w, ngăn cách bằng dấu phẩy. Mỗi node phải nằm trong 1..n, trọng số không âm và k là node nguồn hợp lệ.",
        en: "Enter edges as u-v-w separated by commas. Every node must be in 1..n, weights must be non-negative, and k must be a valid source.",
      },
    });
    return { edges: edgesRaw, n, k, answer: -1, steps };
  }

  const nodes = Array.from({ length: n }, (_, i) => i + 1);
  const graph = Object.fromEntries(nodes.map((node) => [node, []]));
  const dist = Object.fromEntries(nodes.map((node) => [node, Infinity]));
  const parent = Object.fromEntries(nodes.map((node) => [node, null]));
  const finalized = new Set();
  const heap = [];
  const formatValue = (value) => value === Infinity ? "∞" : String(value);
  const distStr = () => `{${nodes.map((node) => `${node}:${formatValue(dist[node])}`).join(", ")}}`;
  const heapStr = (heap) => `[${heap.map(([d, node]) => `(${d}, ${node})`).join(", ")}]`;

  function makeGraph(hlNodes = [], hlEdges = [], annotations = {}) {
    return {
      nodes: nodes.map((id) => ({ id, label: String(id), dist: formatValue(dist[id]) })),
      edges: edgeList,
      hlNodes,
      hlEdges,
      visitedNodes: [...finalized],
      annotations: { [k]: "source", ...annotations },
      dimUnfocused: true,
    };
  }
  function pushStep({
    title,
    codeLine,
    vars,
    note,
    hlNodes = [],
    hlEdges = [],
    annotations = {},
    final = false,
    phase = "build",
    currentNode = null,
    activeEdge = null,
    candidate = null,
    oldDistance = null,
    improves = null,
    answerValue = null,
  }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(hlNodes, hlEdges, annotations),
      networkDelayView: {
        phase,
        source: k,
        distances: nodes.map((node) => ({
          node,
          value: formatValue(dist[node]),
          isSource: node === k,
          isCurrent: node === currentNode,
          isFinalized: finalized.has(node),
          isCandidate: !!activeEdge && node === activeEdge.v,
        })),
        heap: heap.map(([distance, node], index) => ({ distance, node, index })),
        finalized: [...finalized],
        currentNode,
        activeEdge,
        candidate,
        oldDistance: oldDistance === Infinity ? "∞" : oldDistance,
        improves,
        answer: answerValue,
      },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Tạo adjacency list", en: "Create the adjacency list" },
    codeLine: 6,
    phase: "build",
    vars: [{ name: "graph", value: "defaultdict(list)" }],
    note: {
      vi: "graph[u] sẽ lưu các cạnh có hướng đi ra từ u dưới dạng (v, w).",
      en: "graph[u] stores every directed outgoing edge as (v, w).",
    },
  });

  for (const { u, v, w } of edgeList) {
    pushStep({
      title: { vi: `Đọc cạnh ${u} → ${v}`, en: `Read edge ${u} → ${v}` },
      codeLine: 7,
      phase: "build",
      activeEdge: { u, v, w },
      hlNodes: [u, v],
      hlEdges: [[u, v]],
      vars: [{ name: "u, v, w", value: `${u}, ${v}, ${w}` }],
      note: {
        vi: `Tách cạnh thành u = ${u}, v = ${v}, thời gian w = ${w}.`,
        en: `Unpack the edge into u = ${u}, v = ${v}, and travel time w = ${w}.`,
      },
    });
    graph[u].push([v, w]);
    pushStep({
      title: { vi: `graph[${u}].append((${v}, ${w}))`, en: `graph[${u}].append((${v}, ${w}))` },
      codeLine: 8,
      phase: "build",
      activeEdge: { u, v, w },
      hlNodes: [u, v],
      hlEdges: [[u, v]],
      vars: [{ name: `graph[${u}]`, value: `[${graph[u].map(([to, weight]) => `(${to}, ${weight})`).join(", ")}]` }],
      note: {
        vi: `Thêm chuyến truyền tín hiệu ${u} → ${v} mất ${w} đơn vị thời gian vào adjacency list.`,
        en: `Add the ${u} → ${v} signal route taking ${w} time units to the adjacency list.`,
      },
    });
  }

  pushStep({
    title: { vi: "Khởi tạo mọi khoảng cách bằng ∞", en: "Initialize every distance to ∞" },
    codeLine: 9,
    phase: "init",
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: "Chưa có node nào nhận được tín hiệu, nên thời gian ngắn nhất tới mọi node ban đầu là ∞.",
      en: "No node has received the signal yet, so every shortest arrival time starts at ∞.",
    },
  });

  dist[k] = 0;
  pushStep({
    title: { vi: `dist[${k}] = 0`, en: `dist[${k}] = 0` },
    codeLine: 10,
    phase: "init",
    currentNode: k,
    hlNodes: [k],
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: `Node nguồn k = ${k} nhận tín hiệu tại thời điểm 0.`,
      en: `Source node k = ${k} receives the signal at time 0.`,
    },
  });

  heap.push([0, k]);
  pushStep({
    title: { vi: "Đưa nguồn vào min-heap", en: "Push the source into the min-heap" },
    codeLine: 11,
    phase: "init",
    currentNode: k,
    hlNodes: [k],
    vars: [{ name: "heap", value: heapStr(heap) }],
    note: {
      vi: `Heap chứa (distance, node). Bắt đầu với (0, ${k}); phần tử có distance nhỏ nhất luôn được pop trước.`,
      en: `The heap stores (distance, node). It starts with (0, ${k}); the smallest distance is always popped first.`,
    },
  });

  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    pushStep({
      title: { vi: "Heap chưa rỗng", en: "The heap is not empty" },
      codeLine: 12,
      phase: "pop",
      vars: [{ name: "heap", value: heapStr(heap) }],
      note: {
        vi: "Còn trạng thái cần xử lý; tiếp tục lấy trạng thái có thời gian nhỏ nhất.",
        en: "States remain to process; continue with the smallest arrival time.",
      },
    });

    const [d, u] = heap.shift();
    pushStep({
      title: { vi: `heappop → (${d}, ${u})`, en: `heappop → (${d}, ${u})` },
      codeLine: 13,
      phase: "pop",
      currentNode: u,
      hlNodes: [u],
      vars: [
        { name: "d", value: d },
        { name: "u", value: u },
        { name: "heap còn lại", value: heapStr(heap) },
      ],
      note: {
        vi: `Lấy (d=${d}, u=${u}) vì đây là trạng thái có thời gian nhỏ nhất trong heap.`,
        en: `Pop (d=${d}, u=${u}) because it has the smallest time in the heap.`,
      },
    });

    const stale = d > dist[u];
    pushStep({
      title: stale
        ? { vi: `${d} > dist[${u}]=${dist[u]}: bản ghi cũ`, en: `${d} > dist[${u}]=${dist[u]}: stale entry` }
        : { vi: `${d} > dist[${u}]=${dist[u]}? False`, en: `${d} > dist[${u}]=${dist[u]}? False` },
      codeLine: 14,
      phase: stale ? "stale" : "pop",
      currentNode: u,
      hlNodes: [u],
      vars: [
        { name: "d", value: d },
        { name: `dist[${u}]`, value: dist[u] },
        { name: "condition", value: stale },
      ],
      note: stale
        ? {
            vi: `Đã tìm thấy đường tốt hơn tới ${u} trước đó. Bản ghi ${d} trong heap đã cũ nên không được relax cạnh từ nó.`,
            en: `A better route to ${u} was found earlier. Heap entry ${d} is stale and must not relax outgoing edges.`,
          }
        : {
            vi: `d = ${d} vẫn khớp dist[${u}], nên đây là trạng thái tốt nhất hiện tại và được phép mở rộng.`,
            en: `d = ${d} still matches dist[${u}], so this is the current best state and may expand.`,
          },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua bản ghi cũ", en: "Skip the stale entry" },
        codeLine: 15,
        phase: "stale",
        currentNode: u,
        hlNodes: [u],
        vars: [{ name: "continue", value: true }],
        note: {
          vi: "continue quay lại đầu vòng while; không duyệt hàng xóm của bản ghi cũ này.",
          en: "continue returns to the while loop without exploring this stale entry's neighbors.",
        },
      });
      continue;
    }

    finalized.add(u);
    for (const [v, w] of graph[u]) {
      pushStep({
        title: { vi: `Xét cạnh ${u} → ${v}`, en: `Inspect edge ${u} → ${v}` },
        codeLine: 16,
        phase: "inspect",
        currentNode: u,
        activeEdge: { u, v, w },
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "u", value: u },
          { name: "v", value: v },
          { name: "w", value: w },
        ],
        note: {
          vi: `Từ node ${u}, thử truyền tín hiệu qua cạnh tới ${v}, mất thêm ${w} thời gian.`,
          en: `From node ${u}, try sending the signal to ${v}, adding ${w} time.`,
        },
      });

      const newDist = d + w;
      pushStep({
        title: { vi: `new_dist = ${d} + ${w} = ${newDist}`, en: `new_dist = ${d} + ${w} = ${newDist}` },
        codeLine: 17,
        phase: "calculate",
        currentNode: u,
        activeEdge: { u, v, w },
        candidate: newDist,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "d", value: d },
          { name: "w", value: w },
          { name: "new_dist", value: newDist },
        ],
        note: {
          vi: `Nếu đi qua ${u} → ${v}, tín hiệu sẽ tới ${v} tại thời điểm ${newDist}.`,
          en: `Taking ${u} → ${v} would deliver the signal to ${v} at time ${newDist}.`,
        },
      });

      const improves = newDist < dist[v];
      const oldDist = dist[v];
      pushStep({
        title: improves
          ? { vi: `${newDist} < ${formatValue(oldDist)}: có cải thiện`, en: `${newDist} < ${formatValue(oldDist)}: improvement` }
          : { vi: `${newDist} < ${formatValue(oldDist)}? False`, en: `${newDist} < ${formatValue(oldDist)}? False` },
        codeLine: 18,
        phase: "compare",
        currentNode: u,
        activeEdge: { u, v, w },
        candidate: newDist,
        oldDistance: oldDist,
        improves,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "new_dist", value: newDist },
          { name: `dist[${v}]`, value: formatValue(oldDist) },
          { name: "condition", value: improves },
        ],
        note: improves
          ? {
              vi: `${newDist} nhỏ hơn thời gian đang lưu ${formatValue(oldDist)}, nên phải cập nhật đường ngắn nhất tới ${v}.`,
              en: `${newDist} is smaller than the stored time ${formatValue(oldDist)}, so the shortest route to ${v} must be updated.`,
            }
          : {
              vi: `${newDist} không nhỏ hơn ${formatValue(oldDist)}; đường qua ${u} không tốt hơn nên giữ nguyên dist[${v}].`,
              en: `${newDist} is not smaller than ${formatValue(oldDist)}; the route through ${u} is not better, so keep dist[${v}].`,
            },
      });

      if (!improves) continue;

      dist[v] = newDist;
      parent[v] = u;
      pushStep({
        title: { vi: `dist[${v}] = ${newDist}`, en: `dist[${v}] = ${newDist}` },
        codeLine: 19,
        phase: "update",
        currentNode: u,
        activeEdge: { u, v, w },
        candidate: newDist,
        oldDistance: oldDist,
        improves: true,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: `dist[${v}]`, value: newDist },
          { name: "dist", value: distStr() },
        ],
        note: {
          vi: `Ghi thời gian tốt nhất mới của ${v} là ${newDist}. Visualization ghi nhớ cạnh này riêng để có thể tô đường đi ở bước cuối.`,
          en: `Store ${newDist} as ${v}'s new best time. The visualization separately remembers this edge for the final highlighted route.`,
        },
      });

      heap.push([newDist, v]);
      heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      pushStep({
        title: { vi: `heappush((${newDist}, ${v}))`, en: `heappush((${newDist}, ${v}))` },
        codeLine: 20,
        phase: "push",
        currentNode: u,
        activeEdge: { u, v, w },
        candidate: newDist,
        oldDistance: oldDist,
        improves: true,
        hlNodes: [v],
        vars: [
          { name: "pushed", value: `(${newDist}, ${v})` },
          { name: "heap", value: heapStr(heap) },
        ],
        note: {
          vi: `Đưa trạng thái mới của node ${v} vào heap. Heap sẽ tự ưu tiên distance nhỏ nhất ở lần pop tiếp theo.`,
          en: `Push node ${v}'s new state into the heap. The next pop will prioritize the smallest distance.`,
        },
      });
    }
  }

  pushStep({
    title: { vi: "Heap đã rỗng", en: "The heap is empty" },
    codeLine: 12,
    phase: "finish",
    vars: [
      { name: "heap", value: "[]" },
      { name: "dist", value: distStr() },
    ],
    note: {
      vi: "Không còn trạng thái nào để xử lý; mọi khoảng cách ngắn nhất có thể tìm được đã được chốt.",
      en: "No states remain; every reachable shortest distance has been finalized.",
    },
  });

  const maxDist = Math.max(...nodes.map((node) => dist[node]));
  const answer = maxDist === Infinity ? -1 : maxDist;
  pushStep({
    title: { vi: `ans = ${formatValue(maxDist)}`, en: `ans = ${formatValue(maxDist)}` },
    codeLine: 21,
    phase: "finish",
    answerValue: answer,
    hlNodes: maxDist === Infinity ? nodes.filter((node) => dist[node] === Infinity) : nodes.filter((node) => dist[node] === maxDist),
    vars: [
      { name: "dist", value: distStr() },
      { name: "ans", value: formatValue(maxDist) },
    ],
    note: {
      vi: maxDist === Infinity
        ? "Ít nhất một node có dist = ∞, nên max(dist) cũng là ∞."
        : `Node nhận tín hiệu muộn nhất có thời gian ${maxDist}; đây là thời gian chờ để toàn mạng nhận tín hiệu.`,
      en: maxDist === Infinity
        ? "At least one node has dist = ∞, so max(dist) is also ∞."
        : `The last node receives the signal at time ${maxDist}; this is the total network delay.`,
    },
  });

  let pathNodes = [];
  let pathEdges = [];
  if (answer !== -1) {
    const slowest = nodes.find((node) => dist[node] === maxDist);
    let current = slowest;
    pathNodes = [current];
    while (current !== k && parent[current] !== null) {
      pathEdges.unshift([parent[current], current]);
      current = parent[current];
      pathNodes.unshift(current);
    }
  }
  const pathText = pathNodes.join(" → ");
  pushStep({
    title: answer === -1
      ? { vi: "Có node không nhận được tín hiệu", en: "Some node cannot receive the signal" }
      : { vi: `Kết quả ${answer}: ${pathText}`, en: `Result ${answer}: ${pathText}` },
    codeLine: 22,
    phase: "done",
    answerValue: answer,
    hlNodes: answer === -1 ? nodes.filter((node) => dist[node] === Infinity) : pathNodes,
    hlEdges: pathEdges,
    annotations: answer === -1 ? {} : { [pathNodes.at(-1)]: "last" },
    final: true,
    vars: [
      { name: "ans", value: formatValue(maxDist) },
      { name: "answer", value: answer },
      ...(answer === -1 ? [] : [{ name: "slowest path", value: pathText }]),
    ],
    note: answer === -1
      ? {
          vi: "ans = ∞ nghĩa là còn node không thể tới từ nguồn, nên biểu thức trả về -1.",
          en: "ans = ∞ means at least one node is unreachable from the source, so the expression returns -1.",
        }
      : {
          vi: `ans = ${answer} hữu hạn nên trả ${answer}. Đường ${pathText} là đường ngắn nhất tới node nhận tín hiệu muộn nhất.`,
          en: `ans = ${answer} is finite, so return ${answer}. Route ${pathText} is the shortest path to the last node reached.`,
        },
  });

  return { edges: edgesRaw, n, k, answer, steps };
}

/**
 * LeetCode 787: Cheapest Flights Within K Stops.
 * Bounded Bellman-Ford: round r may use at most r + 1 flights.
 */
function find787CheapestPath(n, flights, src, dst, maxFlights) {
  if (src === dst) return { nodes: [src], edges: [] };

  const dist = Array.from({ length: maxFlights + 1 }, () => Array(n).fill(Infinity));
  const parent = Array.from({ length: maxFlights + 1 }, () => Array(n).fill(-1));
  dist[0][src] = 0;

  for (let used = 1; used <= maxFlights; used++) {
    for (const [u, v, price] of flights) {
      if (dist[used - 1][u] === Infinity) continue;
      const candidate = dist[used - 1][u] + price;
      if (candidate < dist[used][v]) {
        dist[used][v] = candidate;
        parent[used][v] = u;
      }
    }
  }

  let bestUsed = -1;
  let bestPrice = Infinity;
  for (let used = 1; used <= maxFlights; used++) {
    if (dist[used][dst] < bestPrice) {
      bestPrice = dist[used][dst];
      bestUsed = used;
    }
  }
  if (bestUsed === -1) return { nodes: [], edges: [] };

  const pathNodes = [dst];
  const pathEdges = [];
  let city = dst;
  for (let used = bestUsed; used > 0; used--) {
    const previous = parent[used][city];
    if (previous === -1) return { nodes: [], edges: [] };
    pathEdges.unshift([previous, city]);
    pathNodes.unshift(previous);
    city = previous;
  }
  return city === src
    ? { nodes: pathNodes, edges: pathEdges }
    : { nodes: [], edges: [] };
}

function make787FlowLayout(n, src, dst) {
  const middle = Array.from({ length: n }, (_, id) => id)
    .filter((id) => id !== src && id !== dst);
  const positions = {};
  positions[src] = { x: 0, y: 0.5 };
  if (dst !== src) positions[dst] = { x: 1, y: 0.5 };
  middle.forEach((id, index) => {
    positions[id] = { x: 0.5, y: (index + 1) / (middle.length + 1) };
  });
  return {
    layout: "flow",
    positions,
    width: 660,
    height: Math.max(440, (middle.length + 1) * 116),
    dimUnfocused: true,
    caption: {
      vi: "src (trái) → trung gian → dst (phải) • số dưới node = giá tốt nhất hiện tại",
      en: "src (left) → intermediate cities → dst (right) • value below node = current best price",
    },
  };
}

function buildSteps787BellmanFord(input, params) {
  const n = Number(params.n);
  const src = Number(params.src);
  const dst = Number(params.dst);
  const k = Number(params.k);
  const flights = String(input)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const valid = Number.isInteger(n) && n > 0
    && Number.isInteger(src) && src >= 0 && src < n
    && Number.isInteger(dst) && dst >= 0 && dst < n
    && Number.isInteger(k) && k >= 0
    && flights.length > 0
    && flights.every(([u, v, price]) => (
      Number.isInteger(u) && u >= 0 && u < n
      && Number.isInteger(v) && v >= 0 && v < n
      && Number.isFinite(price) && price >= 0
    ));

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [4],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Nhập mỗi chuyến bay theo dạng u,v,price và ngăn cách bằng dấu ';'. n, src, dst, k phải là số nguyên hợp lệ.",
        en: "Enter each flight as u,v,price separated by ';'. n, src, dst, and k must be valid integers.",
      },
    });
    return { n, flights, src, dst, k, answer: -1, steps };
  }

  const nodes = Array.from({ length: n }, (_, id) => id);
  const edges = flights.map(([u, v, w]) => ({ u, v, w }));
  const flowLayout = make787FlowLayout(n, src, dst);
  const formatValue = (value) => value === Infinity ? "∞" : String(value);
  const formatCosts = (costs) => `[${costs.map(formatValue).join(", ")}]`;
  const reachable = (costs) => nodes.filter((id) => costs[id] !== Infinity);

  function makeGraph(costs, hlNodes = [], hlEdges = []) {
    const annotations = { [src]: "src", [dst]: "dst" };
    if (src === dst) annotations[src] = "src = dst";
    return {
      nodes: nodes.map((id) => ({ id, label: String(id), dist: costs[id] === Infinity ? "∞" : costs[id] })),
      edges,
      hlNodes,
      hlEdges,
      visitedNodes: reachable(costs),
      annotations,
      ...flowLayout,
    };
  }

  function pushStep({ title, costs, hlNodes = [], hlEdges = [], codeLine, vars, note, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(costs, hlNodes, hlEdges),
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  let cost = new Array(n).fill(Infinity);

  pushStep({
    title: { vi: "Giới hạn số chuyến bay", en: "Translate the stop limit" },
    costs: cost,
    hlNodes: [src, dst],
    codeLine: 4,
    vars: [
      { name: "src", value: src },
      { name: "dst", value: dst },
      { name: "k stops", value: k },
      { name: "max flights", value: k + 1 },
    ],
    note: {
      vi: `Có tối đa ${k} điểm dừng ở giữa nên đường đi được dùng tối đa ${k + 1} chuyến bay (cạnh). Ta sẽ chạy đúng ${k + 1} vòng Bellman-Ford.`,
      en: `At most ${k} intermediate stops means at most ${k + 1} flights (edges). We run exactly ${k + 1} Bellman-Ford rounds.`,
    },
  });

  pushStep({
    title: { vi: "Đặt giá trị vô cực", en: "Define infinity" },
    costs: cost,
    codeLine: 5,
    vars: [{ name: "INF", value: "∞" }],
    note: {
      vi: "INF biểu diễn một thành phố chưa thể tới được với số chuyến bay đang cho phép.",
      en: "INF represents a city that is not reachable with the currently allowed number of flights.",
    },
  });

  pushStep({
    title: { vi: "Khởi tạo cost", en: "Initialize cost" },
    costs: cost,
    codeLine: 6,
    vars: [{ name: "cost", value: formatCosts(cost) }],
    note: {
      vi: "Ban đầu chưa biết cách tới thành phố nào, nên mọi chi phí đều là ∞.",
      en: "Initially no city is known to be reachable, so every cost is ∞.",
    },
  });

  cost[src] = 0;
  pushStep({
    title: { vi: `cost[${src}] = 0`, en: `cost[${src}] = 0` },
    costs: cost,
    hlNodes: [src],
    codeLine: 7,
    vars: [{ name: "cost", value: formatCosts(cost) }],
    note: {
      vi: `Đang đứng tại src = ${src}, chưa mua vé nào nên chi phí là 0.`,
      en: `We start at src = ${src} without taking a flight, so its cost is 0.`,
    },
  });

  for (let used = 0; used <= k; used++) {
    const allowedFlights = used + 1;
    pushStep({
      title: { vi: `Vòng ${allowedFlights}: cho phép tối đa ${allowedFlights} chuyến`, en: `Round ${allowedFlights}: allow at most ${allowedFlights} flights` },
      costs: cost,
      codeLine: 9,
      vars: [
        { name: "used", value: used },
        { name: "allowed flights", value: allowedFlights },
        { name: "cost (vòng trước)", value: formatCosts(cost) },
      ],
      note: {
        vi: `Bắt đầu vòng ${allowedFlights}. Mọi đường mới tạo trong vòng này chỉ được nối thêm đúng một cạnh từ kết quả của vòng trước.`,
        en: `Start round ${allowedFlights}. Every new route in this round extends a previous-round route by exactly one edge.`,
      },
    });

    const nextCost = cost.slice();
    pushStep({
      title: { vi: "Sao chép cost sang next_cost", en: "Copy cost into next_cost" },
      costs: nextCost,
      codeLine: 10,
      vars: [
        { name: "cost (chỉ đọc)", value: formatCosts(cost) },
        { name: "next_cost (sẽ ghi)", value: formatCosts(nextCost) },
      ],
      note: {
        vi: "Đây là dòng quan trọng nhất: cost được giữ nguyên suốt vòng; chỉ next_cost được cập nhật. Vì vậy một vòng không thể vô tình đi qua nhiều cạnh.",
        en: "This is the key line: cost stays frozen throughout the round; only next_cost changes. One round therefore cannot accidentally traverse multiple edges.",
      },
    });

    for (const [u, v, price] of flights) {
      pushStep({
        title: { vi: `Xét chuyến bay ${u} → ${v}, giá ${price}`, en: `Inspect flight ${u} → ${v}, price ${price}` },
        costs: nextCost,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        codeLine: 11,
        vars: [
          { name: "flight", value: `[${u}, ${v}, ${price}]` },
          { name: `cost[${u}] (vòng trước)`, value: formatValue(cost[u]) },
          { name: `next_cost[${v}]`, value: formatValue(nextCost[v]) },
        ],
        note: {
          vi: `Đọc cạnh ${u} → ${v}. Muốn dùng cạnh này, thành phố ${u} phải tới được bằng kết quả đã chốt từ vòng trước.`,
          en: `Read edge ${u} → ${v}. To use it, city ${u} must be reachable in the finalized previous-round result.`,
        },
      });

      if (cost[u] === Infinity) {
        pushStep({
          title: { vi: `Bỏ qua: cost[${u}] = ∞`, en: `Skip: cost[${u}] = ∞` },
          costs: nextCost,
          hlNodes: [u, v],
          hlEdges: [[u, v]],
          codeLine: 12,
          vars: [
            { name: `cost[${u}]`, value: "∞" },
            { name: "condition", value: "False" },
            { name: "next_cost", value: formatCosts(nextCost) },
          ],
          note: {
            vi: `Ở đầu vòng này chưa có đường hợp lệ tới ${u}, nên không thể bay tiếp từ ${u} sang ${v}. next_cost không đổi.`,
            en: `At the start of this round there is no valid route to ${u}, so the flight to ${v} cannot be used. next_cost is unchanged.`,
          },
        });
        continue;
      }

      const candidate = cost[u] + price;
      pushStep({
        title: { vi: `Có thể bay từ ${u}: tính giá ứng viên`, en: `City ${u} is reachable: compute candidate` },
        costs: nextCost,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        codeLine: 12,
        vars: [
          { name: `cost[${u}]`, value: cost[u] },
          { name: "price", value: price },
          { name: "candidate", value: `${cost[u]} + ${price} = ${candidate}` },
          { name: `next_cost[${v}]`, value: formatValue(nextCost[v]) },
        ],
        note: {
          vi: `cost[${u}] hữu hạn, nên đường tới ${v} qua cạnh này hợp lệ. Giá ứng viên = ${cost[u]} + ${price} = ${candidate}.`,
          en: `cost[${u}] is finite, so this edge forms a valid route to ${v}. Candidate = ${cost[u]} + ${price} = ${candidate}.`,
        },
      });

      const oldValue = nextCost[v];
      const improved = candidate < oldValue;
      if (improved) nextCost[v] = candidate;
      pushStep({
        title: improved
          ? { vi: `Cập nhật next_cost[${v}]: ${formatValue(oldValue)} → ${candidate}`, en: `Update next_cost[${v}]: ${formatValue(oldValue)} → ${candidate}` }
          : { vi: `Không cập nhật next_cost[${v}]`, en: `Do not update next_cost[${v}]` },
        costs: nextCost,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        codeLine: 13,
        vars: [
          { name: "candidate", value: candidate },
          { name: `next_cost[${v}] (cũ)`, value: formatValue(oldValue) },
          { name: "min", value: formatValue(nextCost[v]) },
          { name: "next_cost", value: formatCosts(nextCost) },
        ],
        note: improved
          ? {
              vi: `${candidate} nhỏ hơn ${formatValue(oldValue)}, nên ghi ${candidate} vào next_cost[${v}]. cost vẫn chưa đổi trong vòng này.`,
              en: `${candidate} is smaller than ${formatValue(oldValue)}, so write it to next_cost[${v}]. cost remains unchanged during this round.`,
            }
          : {
              vi: `${candidate} không nhỏ hơn ${formatValue(oldValue)}, nên giữ next_cost[${v}] = ${formatValue(oldValue)}.`,
              en: `${candidate} is not smaller than ${formatValue(oldValue)}, so keep next_cost[${v}] = ${formatValue(oldValue)}.`,
            },
      });
    }

    cost = nextCost;
    pushStep({
      title: { vi: `Chốt vòng ${allowedFlights}`, en: `Commit round ${allowedFlights}` },
      costs: cost,
      codeLine: 14,
      vars: [
        { name: "max flights", value: allowedFlights },
        { name: "cost", value: formatCosts(cost) },
        { name: `cost[${dst}]`, value: formatValue(cost[dst]) },
      ],
      note: {
        vi: `Gán cost = next_cost. Từ đây cost[v] là giá thấp nhất để tới v bằng không quá ${allowedFlights} chuyến bay.`,
        en: `Assign cost = next_cost. Now cost[v] is the cheapest price to v using at most ${allowedFlights} flights.`,
      },
    });
  }

  const answer = cost[dst] === Infinity ? -1 : cost[dst];
  const cheapestPath = find787CheapestPath(n, flights, src, dst, k + 1);
  const pathText = cheapestPath.nodes.join(" → ");
  pushStep({
    title: answer === -1
      ? { vi: "Không có đường hợp lệ", en: "No valid route" }
      : { vi: `Đường rẻ nhất: ${pathText}`, en: `Cheapest route: ${pathText}` },
    costs: cost,
    hlNodes: cheapestPath.nodes,
    hlEdges: cheapestPath.edges,
    codeLine: 16,
    vars: [
      { name: `cost[${dst}]`, value: formatValue(cost[dst]) },
      { name: "answer", value: answer },
      ...(answer === -1 ? [] : [{ name: "path", value: pathText }]),
    ],
    note: cost[dst] === Infinity
      ? {
          vi: `Sau ${k + 1} vòng, dst = ${dst} vẫn chưa tới được trong giới hạn ${k} điểm dừng, nên trả -1.`,
          en: `After ${k + 1} rounds, dst = ${dst} is still unreachable within ${k} stops, so return -1.`,
        }
      : {
          vi: `Đường ${pathText} dùng ${cheapestPath.edges.length} chuyến bay và có tổng giá ${cost[dst]}. Các cạnh không thuộc đường này được làm mờ.`,
          en: `Route ${pathText} uses ${cheapestPath.edges.length} flights and costs ${cost[dst]}. Edges outside this route are dimmed.`,
        },
    final: true,
  });

  return { n, flights, src, dst, k, answer, steps };
}

/**
 * State Dijkstra for LeetCode 787.
 * A state is (city, flightsUsed), not just city.
 */
function buildSteps787Dijkstra(input, params) {
  const n = Number(params.n);
  const src = Number(params.src);
  const dst = Number(params.dst);
  const k = Number(params.k);
  const flights = String(input)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const valid = Number.isInteger(n) && n > 0
    && Number.isInteger(src) && src >= 0 && src < n
    && Number.isInteger(dst) && dst >= 0 && dst < n
    && Number.isInteger(k) && k >= 0
    && flights.length > 0
    && flights.every(([u, v, price]) => (
      Number.isInteger(u) && u >= 0 && u < n
      && Number.isInteger(v) && v >= 0 && v < n
      && Number.isFinite(price) && price >= 0
    ));

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      codeBlock: 2,
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Nhập mỗi chuyến bay theo dạng u,v,price và ngăn cách bằng dấu ';'. n, src, dst, k phải là số nguyên hợp lệ.",
        en: "Enter each flight as u,v,price separated by ';'. n, src, dst, and k must be valid integers.",
      },
    });
    return { n, flights, src, dst, k, answer: -1, steps };
  }

  const maxFlights = k + 1;
  const nodes = Array.from({ length: n }, (_, id) => id);
  const edges = flights.map(([u, v, w]) => ({ u, v, w }));
  const flowLayout = make787FlowLayout(n, src, dst);
  const graph = Array.from({ length: n }, () => []);
  const popped = new Set();
  const formatValue = (value) => value === Infinity ? "∞" : String(value);
  const formatState = ([price, city, used]) => `(${price}, ${city}, ${used})`;

  function makeGraph(best, hlNodes = [], hlEdges = []) {
    const annotations = { [src]: "src", [dst]: "dst" };
    if (src === dst) annotations[src] = "src = dst";
    return {
      nodes: nodes.map((id) => {
        const cheapest = Math.min(...best[id]);
        return { id, label: String(id), dist: cheapest === Infinity ? "∞" : cheapest };
      }),
      edges,
      hlNodes,
      hlEdges,
      visitedNodes: [...popped],
      annotations,
      ...flowLayout,
    };
  }

  function formatBest(best) {
    return best.map((row, city) => `${city}:[${row.map(formatValue).join(",")}]`).join("  ");
  }

  function pushStep({ title, best, hlNodes = [], hlEdges = [], codeLine, vars, note, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(best, hlNodes, hlEdges),
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      codeBlock: 2,
      vars,
      note,
    });
  }

  const emptyBest = Array.from({ length: n }, () => Array(maxFlights + 1).fill(Infinity));
  pushStep({
    title: { vi: "Dijkstra cần thêm số chuyến vào trạng thái", en: "Dijkstra needs flights used in its state" },
    best: emptyBest,
    hlNodes: [src, dst],
    codeLine: 6,
    vars: [
      { name: "state", value: "(price, city, flights_used)" },
      { name: "k stops", value: k },
      { name: "max_flights", value: maxFlights },
    ],
    note: {
      vi: `Đây là Dijkstra trên đồ thị trạng thái. Một trạng thái phải chứa cả city và flights_used; ${k} điểm dừng cho phép tối đa ${maxFlights} chuyến bay.`,
      en: `This is Dijkstra on a state graph. A state must include both city and flights_used; ${k} stops allow at most ${maxFlights} flights.`,
    },
  });

  pushStep({
    title: { vi: "Tạo adjacency list", en: "Create the adjacency list" },
    best: emptyBest,
    codeLine: 7,
    vars: [{ name: "graph", value: "[[], ..., []]" }],
    note: {
      vi: "graph[u] sẽ chứa các cặp (v, ticket) có thể bay trực tiếp từ u.",
      en: "graph[u] will contain each direct (v, ticket) flight from u.",
    },
  });

  for (const [u, v, ticket] of flights) {
    pushStep({
      title: { vi: `Đọc chuyến bay ${u} → ${v}`, en: `Read flight ${u} → ${v}` },
      best: emptyBest,
      hlNodes: [u, v],
      hlEdges: [[u, v]],
      codeLine: 8,
      vars: [{ name: "flight", value: `[${u}, ${v}, ${ticket}]` }],
      note: {
        vi: `Tách chuyến bay thành u = ${u}, v = ${v}, ticket = ${ticket}.`,
        en: `Unpack the flight into u = ${u}, v = ${v}, ticket = ${ticket}.`,
      },
    });
    graph[u].push([v, ticket]);
    pushStep({
      title: { vi: `Thêm (${v}, ${ticket}) vào graph[${u}]`, en: `Append (${v}, ${ticket}) to graph[${u}]` },
      best: emptyBest,
      hlNodes: [u, v],
      hlEdges: [[u, v]],
      codeLine: 9,
      vars: [{ name: `graph[${u}]`, value: `[${graph[u].map(([to, price]) => `(${to},${price})`).join(", ")}]` }],
      note: {
        vi: `Từ thành phố ${u}, Dijkstra có thể duyệt cạnh tới ${v} với giá vé ${ticket}.`,
        en: `From city ${u}, Dijkstra can traverse the edge to ${v} with ticket price ${ticket}.`,
      },
    });
  }

  pushStep({
    title: { vi: `max_flights = ${maxFlights}`, en: `max_flights = ${maxFlights}` },
    best: emptyBest,
    codeLine: 11,
    vars: [
      { name: "k", value: k },
      { name: "max_flights", value: `${k} + 1 = ${maxFlights}` },
    ],
    note: {
      vi: `${k} điểm dừng ở giữa tương ứng tối đa ${maxFlights} cạnh/chuyến bay.`,
      en: `${k} intermediate stops correspond to at most ${maxFlights} edges/flights.`,
    },
  });

  const best = emptyBest.map((row) => row.slice());
  pushStep({
    title: { vi: "Khởi tạo bảng best", en: "Initialize the best table" },
    best,
    codeLine: 12,
    vars: [
      { name: "best[city][used]", value: "minimum price" },
      { name: "best", value: formatBest(best) },
    ],
    note: {
      vi: `best[city][used] lưu giá nhỏ nhất tới city khi dùng đúng used chuyến. Có ${maxFlights + 1} cột, từ 0 tới ${maxFlights} chuyến.`,
      en: `best[city][used] stores the cheapest price to city using exactly used flights. It has ${maxFlights + 1} columns, from 0 to ${maxFlights} flights.`,
    },
  });

  best[src][0] = 0;
  pushStep({
    title: { vi: `best[${src}][0] = 0`, en: `best[${src}][0] = 0` },
    best,
    hlNodes: [src],
    codeLine: 13,
    vars: [{ name: "best", value: formatBest(best) }],
    note: {
      vi: `Bắt đầu tại src = ${src}, giá 0 và chưa dùng chuyến bay nào.`,
      en: `Start at src = ${src} with price 0 and no flights used.`,
    },
  });

  const heap = [[0, src, 0]];
  pushStep({
    title: { vi: "Đưa trạng thái đầu vào min-heap", en: "Push the initial state into the min-heap" },
    best,
    hlNodes: [src],
    codeLine: 14,
    vars: [{ name: "heap", value: `[${formatState(heap[0])}]` }],
    note: {
      vi: "Heap sắp xếp theo price trước tiên, nên trạng thái có tổng giá nhỏ nhất luôn được lấy ra trước.",
      en: "The heap orders by price first, so the state with the smallest total price is always popped first.",
    },
  });

  let answer = -1;
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    pushStep({
      title: { vi: "Heap còn trạng thái", en: "The heap still has states" },
      best,
      codeLine: 16,
      vars: [{ name: "heap", value: `[${heap.map(formatState).join(", ")}]` }],
      note: {
        vi: "Tiếp tục Dijkstra vì heap chưa rỗng. Phần tử đầu có price nhỏ nhất.",
        en: "Continue Dijkstra because the heap is not empty. Its first item has the smallest price.",
      },
    });

    const [price, u, used] = heap.shift();
    popped.add(u);
    pushStep({
      title: { vi: `Pop (${price}, ${u}, ${used})`, en: `Pop (${price}, ${u}, ${used})` },
      best,
      hlNodes: [u],
      codeLine: 17,
      vars: [
        { name: "price", value: price },
        { name: "u", value: u },
        { name: "used", value: used },
        { name: "heap còn lại", value: `[${heap.map(formatState).join(", ")}]` },
      ],
      note: {
        vi: `Lấy trạng thái rẻ nhất: đang ở thành phố ${u}, tổng giá ${price}, đã dùng ${used} chuyến.`,
        en: `Pop the cheapest state: city ${u}, total price ${price}, with ${used} flights used.`,
      },
    });

    if (u === dst) {
      answer = price;
      const cheapestPath = find787CheapestPath(n, flights, src, dst, maxFlights);
      const pathText = cheapestPath.nodes.join(" → ");
      pushStep({
        title: { vi: `Đường rẻ nhất: ${pathText}`, en: `Cheapest route: ${pathText}` },
        best,
        hlNodes: cheapestPath.nodes,
        hlEdges: cheapestPath.edges,
        codeLine: 18,
        vars: [
          { name: "u == dst", value: true },
          { name: "used", value: used },
          { name: "answer", value: price },
          { name: "path", value: pathText },
        ],
        note: {
          vi: `Heap xác nhận ${price} là giá nhỏ nhất. Highlight đường ${pathText}; các cạnh không thuộc đường này được làm mờ.`,
          en: `The heap confirms ${price} is minimal. Route ${pathText} is highlighted; all other edges are dimmed.`,
        },
        final: true,
      });
      break;
    }

    pushStep({
      title: { vi: `${u} chưa phải dst`, en: `${u} is not dst` },
      best,
      hlNodes: [u, dst],
      codeLine: 18,
      vars: [
        { name: "u", value: u },
        { name: "dst", value: dst },
        { name: "u == dst", value: false },
      ],
      note: {
        vi: `Thành phố ${u} chưa phải đích ${dst}, nên cần kiểm tra trạng thái rồi mới mở rộng các chuyến bay tiếp theo.`,
        en: `City ${u} is not destination ${dst}, so validate the state before expanding outgoing flights.`,
      },
    });

    if (price !== best[u][used]) {
      pushStep({
        title: { vi: "Bỏ trạng thái cũ", en: "Discard stale state" },
        best,
        hlNodes: [u],
        codeLine: 19,
        vars: [
          { name: "price", value: price },
          { name: `best[${u}][${used}]`, value: formatValue(best[u][used]) },
        ],
        note: {
          vi: `Heap chứa bản ghi cũ giá ${price}, nhưng best hiện là ${best[u][used]}; không mở rộng bản ghi kém hơn này.`,
          en: `The heap entry costs ${price}, but the current best is ${best[u][used]}; do not expand this stale state.`,
        },
      });
      continue;
    }

    pushStep({
      title: { vi: "Trạng thái vẫn là tốt nhất", en: "The state is still optimal" },
      best,
      hlNodes: [u],
      codeLine: 19,
      vars: [
        { name: "price", value: price },
        { name: `best[${u}][${used}]`, value: best[u][used] },
        { name: "stale", value: false },
      ],
      note: {
        vi: `price = best[${u}][${used}] = ${price}, nên đây không phải bản ghi cũ và có thể tiếp tục.`,
        en: `price = best[${u}][${used}] = ${price}, so this is not stale and may continue.`,
      },
    });

    if (used === maxFlights) {
      pushStep({
        title: { vi: `Đã dùng đủ ${maxFlights} chuyến: không bay tiếp`, en: `Already used ${maxFlights} flights: stop expanding` },
        best,
        hlNodes: [u],
        codeLine: 20,
        vars: [
          { name: "used", value: used },
          { name: "max_flights", value: maxFlights },
        ],
        note: {
          vi: `Trạng thái ở ${u} đã dùng tối đa ${maxFlights} chuyến. Bay thêm sẽ vượt giới hạn k = ${k} điểm dừng.`,
          en: `The state at ${u} has used all ${maxFlights} flights. Another flight would exceed k = ${k} stops.`,
        },
      });
      continue;
    }

    pushStep({
      title: { vi: `Còn lượt bay từ thành phố ${u}`, en: `Flights remain available from city ${u}` },
      best,
      hlNodes: [u],
      codeLine: 20,
      vars: [
        { name: "used", value: used },
        { name: "max_flights", value: maxFlights },
        { name: "remaining", value: maxFlights - used },
      ],
      note: {
        vi: `${used} < ${maxFlights}, nên trạng thái này còn ${maxFlights - used} chuyến bay và được phép mở rộng.`,
        en: `${used} < ${maxFlights}, so this state has ${maxFlights - used} flights remaining and may expand.`,
      },
    });

    for (const [v, ticket] of graph[u]) {
      pushStep({
        title: { vi: `Xét cạnh ${u} → ${v}`, en: `Inspect edge ${u} → ${v}` },
        best,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        codeLine: 22,
        vars: [
          { name: "v", value: v },
          { name: "ticket", value: ticket },
        ],
        note: {
          vi: `Duyệt chuyến bay trực tiếp từ ${u} tới ${v}, giá vé ${ticket}.`,
          en: `Inspect the direct flight from ${u} to ${v} with ticket price ${ticket}.`,
        },
      });

      const newPrice = price + ticket;
      pushStep({
        title: { vi: `new_price = ${price} + ${ticket} = ${newPrice}`, en: `new_price = ${price} + ${ticket} = ${newPrice}` },
        best,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        codeLine: 23,
        vars: [
          { name: "price", value: price },
          { name: "ticket", value: ticket },
          { name: "new_price", value: newPrice },
        ],
        note: {
          vi: `Nếu chọn chuyến bay này, tổng giá mới là ${price} + ${ticket} = ${newPrice}.`,
          en: `Taking this flight produces a new total price of ${price} + ${ticket} = ${newPrice}.`,
        },
      });

      const nextUsed = used + 1;
      pushStep({
        title: { vi: `next_used = ${used} + 1 = ${nextUsed}`, en: `next_used = ${used} + 1 = ${nextUsed}` },
        best,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        codeLine: 24,
        vars: [
          { name: "used", value: used },
          { name: "next_used", value: nextUsed },
          { name: `best[${v}][${nextUsed}]`, value: formatValue(best[v][nextUsed]) },
        ],
        note: {
          vi: `Đi qua một cạnh làm số chuyến đã dùng tăng từ ${used} lên ${nextUsed}. Đây là một trạng thái riêng tại thành phố ${v}.`,
          en: `Traversing one edge increases flights used from ${used} to ${nextUsed}. This is a distinct state at city ${v}.`,
        },
      });

      const oldPrice = best[v][nextUsed];
      if (newPrice >= oldPrice) {
        pushStep({
          title: { vi: "Không cải thiện trạng thái", en: "The state is not improved" },
          best,
          hlNodes: [u, v],
          hlEdges: [[u, v]],
          codeLine: 25,
          vars: [
            { name: "new_price", value: newPrice },
            { name: `best[${v}][${nextUsed}]`, value: formatValue(oldPrice) },
            { name: "condition", value: false },
          ],
          note: {
            vi: `${newPrice} không nhỏ hơn ${formatValue(oldPrice)}, nên không cập nhật và không push thêm vào heap.`,
            en: `${newPrice} is not smaller than ${formatValue(oldPrice)}, so do not update or push another heap state.`,
          },
        });
        continue;
      }

      pushStep({
        title: { vi: "Tìm thấy giá tốt hơn", en: "Found a better price" },
        best,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        codeLine: 25,
        vars: [
          { name: "new_price", value: newPrice },
          { name: `best[${v}][${nextUsed}]`, value: formatValue(oldPrice) },
          { name: "condition", value: true },
        ],
        note: {
          vi: `${newPrice} < ${formatValue(oldPrice)}, nên trạng thái (city=${v}, used=${nextUsed}) được cải thiện.`,
          en: `${newPrice} < ${formatValue(oldPrice)}, so state (city=${v}, used=${nextUsed}) is improved.`,
        },
      });

      best[v][nextUsed] = newPrice;
      pushStep({
        title: { vi: `Cập nhật best[${v}][${nextUsed}] = ${newPrice}`, en: `Update best[${v}][${nextUsed}] = ${newPrice}` },
        best,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        codeLine: 26,
        vars: [{ name: "best", value: formatBest(best) }],
        note: {
          vi: `Ghi giá nhỏ nhất ${newPrice} cho trạng thái tới thành phố ${v} bằng đúng ${nextUsed} chuyến.`,
          en: `Store ${newPrice} as the cheapest price to city ${v} using exactly ${nextUsed} flights.`,
        },
      });

      heap.push([newPrice, v, nextUsed]);
      heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
      pushStep({
        title: { vi: "Push trạng thái mới vào heap", en: "Push the new state into the heap" },
        best,
        hlNodes: [v],
        codeLine: 27,
        vars: [
          { name: "pushed", value: formatState([newPrice, v, nextUsed]) },
          { name: "heap", value: `[${heap.map(formatState).join(", ")}]` },
        ],
        note: {
          vi: `Đưa (${newPrice}, ${v}, ${nextUsed}) vào min-heap. Heap sẽ quyết định trạng thái rẻ nhất tiếp theo, không phải số cạnh ít nhất.`,
          en: `Push (${newPrice}, ${v}, ${nextUsed}) into the min-heap. The heap chooses the cheapest next state, not the one with the fewest edges.`,
        },
      });
    }
  }

  if (answer === -1) {
    pushStep({
      title: { vi: "Heap rỗng: không có đường hợp lệ", en: "Heap empty: no valid route" },
      best,
      hlNodes: [dst],
      codeLine: 28,
      vars: [
        { name: "heap", value: "[]" },
        { name: "answer", value: -1 },
      ],
      note: {
        vi: `Đã duyệt hết mọi trạng thái dùng không quá ${maxFlights} chuyến mà không tới dst = ${dst}, nên trả -1.`,
        en: `All states using at most ${maxFlights} flights were explored without reaching dst = ${dst}, so return -1.`,
      },
      final: true,
    });
  }

  return { n, flights, src, dst, k, answer, steps };
}

function buildSteps787(input, params) {
  const approach = Number(params && params.approach) || 1;
  return approach === 2
    ? buildSteps787Dijkstra(input, params)
    : buildSteps787BellmanFord(input, params);
}

function make1514FlowLayout(n, startNode, endNode) {
  const middle = Array.from({ length: n }, (_, id) => id)
    .filter((id) => id !== startNode && id !== endNode);
  const positions = {
    [startNode]: { x: 0, y: 0.78 },
    [endNode]: { x: 1, y: 0.78 },
  };
  middle.forEach((id, index) => {
    positions[id] = {
      x: middle.length === 1 ? 0.5 : 0.18 + (0.64 * index) / (middle.length - 1),
      y: 0.18 + 0.12 * (index % 2),
    };
  });
  return {
    layout: "flow",
    positions,
    width: Math.max(660, n * 105),
    height: 440,
    dimUnfocused: true,
    caption: {
      vi: "Cạnh vô hướng • số dưới node = xác suất tốt nhất hiện tại",
      en: "Undirected edges • value below node = current best probability",
    },
  };
}

function make1976FlowLayout(n, roads) {
  const target = n - 1;
  const adjacency = Array.from({ length: n }, () => []);
  roads.forEach(([u, v, w]) => {
    adjacency[u].push([v, w]);
    adjacency[v].push([u, w]);
  });
  const layoutDist = new Array(n).fill(Infinity);
  const queue = [[0, 0]];
  layoutDist[0] = 0;
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [time, u] = queue.shift();
    if (time !== layoutDist[u]) continue;
    for (const [v, w] of adjacency[u]) {
      const next = time + w;
      if (next < layoutDist[v]) {
        layoutDist[v] = next;
        queue.push([next, v]);
      }
    }
  }

  const positions = { 0: { x: 0, y: 0.12 } };
  if (target !== 0) positions[target] = { x: 1, y: 0.12 };
  const middle = Array.from({ length: n }, (_, id) => id)
    .filter((id) => id !== 0 && id !== target);
  const finiteLevels = [...new Set(middle.map((id) => layoutDist[id]).filter(Number.isFinite))]
    .sort((a, b) => a - b);
  const unreachableLevel = finiteLevels.length;
  const groups = new Map();
  middle.forEach((id) => {
    const level = Number.isFinite(layoutDist[id]) ? finiteLevels.indexOf(layoutDist[id]) : unreachableLevel;
    if (!groups.has(level)) groups.set(level, []);
    groups.get(level).push(id);
  });
  const levelCount = Math.max(1, groups.size);
  [...groups.entries()].sort(([a], [b]) => a - b).forEach(([level, ids], column) => {
    ids.forEach((id, row) => {
      positions[id] = {
        x: 0.12 + (0.76 * (column + 1)) / (levelCount + 1),
        y: ids.length === 1 ? 0.62 : 0.34 + (0.54 * row) / (ids.length - 1),
      };
    });
  });
  return {
    layout: "flow",
    positions,
    width: Math.max(760, levelCount * 170 + 360),
    height: 500,
    dimUnfocused: true,
    caption: {
      vi: "Cạnh vô hướng • dưới node: d = thời gian ngắn nhất, w = số cách",
      en: "Undirected edges • below each node: d = shortest time, w = number of ways",
    },
  };
}

/**
 * LeetCode 1976: Number of Ways to Arrive at Destination.
 * Dijkstra tracks both the shortest distance and how many paths attain it.
 */
function buildSteps1976(input, params) {
  const n = Number(params.n);
  const roads = String(input)
    .split(";")
    .map((road) => road.trim())
    .filter(Boolean)
    .map((road) => road.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const valid = Number.isInteger(n) && n >= 1 && n <= 30
    && (roads.length > 0 || n === 1)
    && roads.every((road) => road.length === 3
      && Number.isInteger(road[0]) && road[0] >= 0 && road[0] < n
      && Number.isInteger(road[1]) && road[1] >= 0 && road[1] < n
      && road[0] !== road[1]
      && Number.isInteger(road[2]) && road[2] > 0);

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [7],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Nhập mỗi đường theo dạng u,v,time và ngăn cách bằng ';'. Node phải thuộc 0..n-1, time là số nguyên dương; visualization hỗ trợ tối đa 30 node.",
        en: "Enter each road as u,v,time separated by ';'. Nodes must be in 0..n-1 and time must be a positive integer; the visualization supports up to 30 nodes.",
      },
    });
    return { n, roads, answer: 0, steps };
  }

  const MOD = 1000000007;
  const nodes = Array.from({ length: n }, (_, id) => id);
  const graph = Array.from({ length: n }, () => []);
  const dist = new Array(n).fill(Infinity);
  const ways = new Array(n).fill(0);
  const predecessors = Array.from({ length: n }, () => new Set());
  const finalized = new Set();
  const heap = [];
  const edges = roads.map(([u, v, w]) => ({ u, v, w, undirected: true }));
  const layout = make1976FlowLayout(n, roads);
  const formatDist = (value) => Number.isFinite(value) ? String(value) : "∞";
  const distStr = () => `[${dist.map(formatDist).join(", ")}]`;
  const waysStr = () => `[${ways.join(", ")}]`;
  const heapStr = () => `[${heap.map(([time, node]) => `(${time}, ${node})`).join(", ")}]`;

  function makeGraph(hlNodes = [], hlEdges = [], annotations = {}) {
    return {
      nodes: nodes.map((id) => ({
        id,
        label: String(id),
        dist: `d:${formatDist(dist[id])} · w:${ways[id]}`,
      })),
      edges,
      hlNodes,
      hlEdges,
      visitedNodes: [...finalized],
      annotations: { 0: "src", [n - 1]: "dst", ...annotations },
      ...layout,
    };
  }

  function pushStep({ title, codeLine, vars, note, hlNodes = [], hlEdges = [], annotations = {}, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(hlNodes, hlEdges, annotations),
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Đặt modulo = 1,000,000,007", en: "Set modulo to 1,000,000,007" },
    codeLine: 6,
    vars: [{ name: "MOD", value: MOD }],
    note: {
      vi: "Số đường có thể rất lớn. Chỉ mảng ways cần lấy modulo; dist luôn giữ thời gian thật để so sánh chính xác.",
      en: "The number of paths can be huge. Only ways is reduced modulo MOD; dist keeps exact travel times for comparisons.",
    },
  });

  pushStep({
    title: { vi: "Khởi tạo adjacency list", en: "Initialize the adjacency list" },
    codeLine: 7,
    vars: [{ name: "graph", value: `[${nodes.map(() => "[]").join(", ")}]` }],
    note: {
      vi: "graph[u] sẽ chứa các cặp (v, time) của những đường nối trực tiếp với u.",
      en: "graph[u] will contain (v, time) pairs for roads directly connected to u.",
    },
  });

  for (const [u, v, travelTime] of roads) {
    pushStep({
      title: { vi: `Đọc road [${u}, ${v}, ${travelTime}]`, en: `Read road [${u}, ${v}, ${travelTime}]` },
      codeLine: 8,
      hlNodes: [u, v],
      hlEdges: [[u, v]],
      vars: [{ name: "u, v, time", value: `${u}, ${v}, ${travelTime}` }],
      note: {
        vi: `Đường nối node ${u} và ${v}, cần ${travelTime} đơn vị thời gian. Road là vô hướng nên phải lưu cả hai chiều.`,
        en: `The road connects ${u} and ${v} in ${travelTime} time units. Roads are undirected, so both directions must be stored.`,
      },
    });

    graph[u].push([v, travelTime]);
    pushStep({
      title: { vi: `Thêm ${u} → ${v}`, en: `Add ${u} → ${v}` },
      codeLine: 9,
      hlNodes: [u, v],
      hlEdges: [[u, v]],
      vars: [{ name: `graph[${u}]`, value: `[${graph[u].map(([to, w]) => `(${to}, ${w})`).join(", ")}]` }],
      note: {
        vi: `Thêm (${v}, ${travelTime}) vào graph[${u}] cho chiều đi từ ${u} sang ${v}.`,
        en: `Append (${v}, ${travelTime}) to graph[${u}] for travel from ${u} to ${v}.`,
      },
    });

    graph[v].push([u, travelTime]);
    pushStep({
      title: { vi: `Thêm chiều ngược ${v} → ${u}`, en: `Add reverse direction ${v} → ${u}` },
      codeLine: 10,
      hlNodes: [u, v],
      hlEdges: [[v, u]],
      vars: [{ name: `graph[${v}]`, value: `[${graph[v].map(([to, w]) => `(${to}, ${w})`).join(", ")}]` }],
      note: {
        vi: `Vì road vô hướng, thêm (${u}, ${travelTime}) vào graph[${v}].`,
        en: `Because the road is undirected, append (${u}, ${travelTime}) to graph[${v}].`,
      },
    });
  }

  pushStep({
    title: { vi: "Khởi tạo dist bằng ∞", en: "Initialize dist to ∞" },
    codeLine: 12,
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: "dist[x] là thời gian ngắn nhất đã biết từ node 0 tới x. ∞ nghĩa là chưa tìm thấy đường.",
      en: "dist[x] is the shortest known time from node 0 to x. ∞ means no route has been found.",
    },
  });

  pushStep({
    title: { vi: "Khởi tạo ways bằng 0", en: "Initialize ways to 0" },
    codeLine: 13,
    vars: [{ name: "ways", value: waysStr() }],
    note: {
      vi: "ways[x] đếm số đường đạt đúng dist[x]. Ban đầu chưa có đường nào tới các node.",
      en: "ways[x] counts routes that attain exactly dist[x]. Initially no node has a known route.",
    },
  });

  dist[0] = 0;
  pushStep({
    title: { vi: "dist[0] = 0", en: "dist[0] = 0" },
    codeLine: 14,
    hlNodes: [0],
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: "Đang đứng tại node nguồn 0 nên thời gian để tới chính nó bằng 0.",
      en: "We start at source node 0, so reaching it takes zero time.",
    },
  });

  ways[0] = 1;
  pushStep({
    title: { vi: "ways[0] = 1", en: "ways[0] = 1" },
    codeLine: 15,
    hlNodes: [0],
    vars: [{ name: "ways", value: waysStr() }],
    note: {
      vi: "Có đúng một cách khởi đầu tại node 0: đường rỗng chưa đi qua road nào.",
      en: "There is exactly one way to start at node 0: the empty route using no road.",
    },
  });

  heap.push([0, 0]);
  pushStep({
    title: { vi: "Đưa nguồn vào min-heap", en: "Push the source into the min-heap" },
    codeLine: 16,
    hlNodes: [0],
    vars: [{ name: "heap", value: heapStr() }],
    note: {
      vi: "Heap lưu (time, node) và luôn pop trạng thái có time nhỏ nhất trước.",
      en: "The heap stores (time, node) and always pops the smallest time first.",
    },
  });

  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    pushStep({
      title: { vi: "Heap chưa rỗng", en: "The heap is not empty" },
      codeLine: 18,
      vars: [{ name: "heap", value: heapStr() }],
      note: {
        vi: "Tiếp tục Dijkstra với trạng thái có thời gian nhỏ nhất ở đầu heap.",
        en: "Continue Dijkstra with the smallest-time state at the front of the heap.",
      },
    });

    const [time, u] = heap.shift();
    pushStep({
      title: { vi: `Pop (${time}, ${u})`, en: `Pop (${time}, ${u})` },
      codeLine: 19,
      hlNodes: [u],
      vars: [
        { name: "time", value: time },
        { name: "u", value: u },
        { name: "heap còn lại", value: heapStr() },
      ],
      note: {
        vi: `Lấy node ${u} với thời gian ${time}, là trạng thái nhỏ nhất hiện có trong heap.`,
        en: `Pop node ${u} at time ${time}, currently the smallest state in the heap.`,
      },
    });

    const stale = time > dist[u];
    pushStep({
      title: stale
        ? { vi: `${time} > dist[${u}]=${dist[u]}: stale`, en: `${time} > dist[${u}]=${dist[u]}: stale` }
        : { vi: `${time} > dist[${u}]? False`, en: `${time} > dist[${u}]? False` },
      codeLine: 20,
      hlNodes: [u],
      vars: [
        { name: "time", value: time },
        { name: `dist[${u}]`, value: dist[u] },
        { name: "condition", value: stale },
      ],
      note: stale
        ? {
            vi: `Node ${u} đã có đường ngắn hơn ${dist[u]}; bản ghi ${time} đã cũ và không được dùng để đếm thêm đường.`,
            en: `Node ${u} already has a shorter time ${dist[u]}; entry ${time} is stale and must not count more paths.`,
          }
        : {
            vi: `time vẫn bằng dist[${u}], nên có thể relax các road kề từ trạng thái hợp lệ này.`,
            en: `time still matches dist[${u}], so adjacent roads may be relaxed from this valid state.`,
          },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua stale entry", en: "Skip the stale entry" },
        codeLine: 21,
        hlNodes: [u],
        vars: [{ name: "continue", value: true }],
        note: {
          vi: "Quay lại đầu vòng while mà không duyệt hàng xóm, tránh dùng một đường dài hơn để cập nhật dist hoặc ways.",
          en: "Return to the while loop without exploring neighbors, preventing a longer route from updating dist or ways.",
        },
      });
      continue;
    }

    finalized.add(u);
    for (const [v, travelTime] of graph[u]) {
      pushStep({
        title: { vi: `Xét road ${u} — ${v}`, en: `Inspect road ${u} — ${v}` },
        codeLine: 22,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "v", value: v },
          { name: "travel_time", value: travelTime },
          { name: `ways[${u}]`, value: ways[u] },
        ],
        note: {
          vi: `Thử nối mỗi đường ngắn nhất tới ${u} với road ${u} — ${v} mất ${travelTime} thời gian.`,
          en: `Extend every shortest route to ${u} across road ${u} — ${v}, which takes ${travelTime}.`,
        },
      });

      const newTime = time + travelTime;
      pushStep({
        title: { vi: `new_time = ${time} + ${travelTime} = ${newTime}`, en: `new_time = ${time} + ${travelTime} = ${newTime}` },
        codeLine: 23,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "time", value: time },
          { name: "travel_time", value: travelTime },
          { name: "new_time", value: newTime },
        ],
        note: {
          vi: `Nếu đi qua ${u}, ta tới ${v} tại thời điểm ${newTime}. Bây giờ so sánh với dist[${v}].`,
          en: `Going through ${u} reaches ${v} at time ${newTime}. Now compare it with dist[${v}].`,
        },
      });

      const oldDist = dist[v];
      const shorter = newTime < oldDist;
      pushStep({
        title: shorter
          ? { vi: `${newTime} < ${formatDist(oldDist)}: ngắn hơn`, en: `${newTime} < ${formatDist(oldDist)}: shorter` }
          : { vi: `${newTime} < ${formatDist(oldDist)}? False`, en: `${newTime} < ${formatDist(oldDist)}? False` },
        codeLine: 24,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "new_time", value: newTime },
          { name: `dist[${v}]`, value: formatDist(oldDist) },
          { name: "condition", value: shorter },
        ],
        note: shorter
          ? {
              vi: `Tìm thấy thời gian nhỏ hơn tới ${v}. Mọi đường cũ dài hơn không còn được tính; phải thay dist và ways.`,
              en: `A smaller time to ${v} was found. All older longer routes stop counting; replace both dist and ways.`,
            }
          : {
              vi: `new_time không nhỏ hơn dist[${v}]. Chưa kết luận bỏ qua: vẫn phải kiểm tra trường hợp BẰNG NHAU ở dòng 28.`,
              en: `new_time is not smaller than dist[${v}]. Do not discard it yet: line 28 must still check for EQUALITY.`,
            },
      });

      if (shorter) {
        dist[v] = newTime;
        predecessors[v] = new Set([u]);
        pushStep({
          title: { vi: `dist[${v}] = ${newTime}`, en: `dist[${v}] = ${newTime}` },
          codeLine: 25,
          hlNodes: [u, v],
          hlEdges: [[u, v]],
          vars: [{ name: "dist", value: distStr() }],
          note: {
            vi: `Ghi ${newTime} là thời gian ngắn nhất mới tới ${v}. Visualization thay predecessor của ${v} bằng ${u}.`,
            en: `Store ${newTime} as the new shortest time to ${v}. The visualization replaces ${v}'s predecessor with ${u}.`,
          },
        });

        ways[v] = ways[u];
        pushStep({
          title: { vi: `ways[${v}] = ways[${u}] = ${ways[u]}`, en: `ways[${v}] = ways[${u}] = ${ways[u]}` },
          codeLine: 26,
          hlNodes: [u, v],
          hlEdges: [[u, v]],
          vars: [{ name: "ways", value: waysStr() }],
          note: {
            vi: `Vì đường mới NGẮN HƠN, xóa ảnh hưởng của mọi cách cũ tới ${v}. Số cách mới đúng bằng ${ways[u]} cách ngắn nhất tới ${u}.`,
            en: `Because the new route is SHORTER, discard all old ways to ${v}. The new count equals the ${ways[u]} shortest ways to ${u}.`,
          },
        });

        heap.push([newTime, v]);
        heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        pushStep({
          title: { vi: `Push (${newTime}, ${v})`, en: `Push (${newTime}, ${v})` },
          codeLine: 27,
          hlNodes: [v],
          vars: [{ name: "heap", value: heapStr() }],
          note: {
            vi: `dist[${v}] đã giảm nên push trạng thái mới. Chỉ nhánh ngắn hơn cần push heap.`,
            en: `dist[${v}] decreased, so push its new state. Only the shorter branch needs a heap push.`,
          },
        });
        continue;
      }

      const equal = newTime === dist[v];
      pushStep({
        title: equal
          ? { vi: `${newTime} == dist[${v}]: thêm số cách`, en: `${newTime} == dist[${v}]: add path counts` }
          : { vi: `${newTime} == dist[${v}]? False`, en: `${newTime} == dist[${v}]? False` },
        codeLine: 28,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "new_time", value: newTime },
          { name: `dist[${v}]`, value: formatDist(dist[v]) },
          { name: "condition", value: equal },
        ],
        note: equal
          ? {
              vi: `Đường qua ${u} cũng tới ${v} với đúng thời gian tối ưu ${dist[v]}. Đây là các cách mới, không thay dist.`,
              en: `Routes through ${u} also reach ${v} at the optimal time ${dist[v]}. They add new ways without changing dist.`,
            }
          : {
              vi: `${newTime} lớn hơn dist[${v}] = ${formatDist(dist[v])}; đường này dài hơn nên không ảnh hưởng dist hoặc ways.`,
              en: `${newTime} is greater than dist[${v}] = ${formatDist(dist[v])}; this longer route changes neither dist nor ways.`,
            },
      });

      if (equal) {
        const oldWays = ways[v];
        ways[v] = (ways[v] + ways[u]) % MOD;
        predecessors[v].add(u);
        pushStep({
          title: { vi: `ways[${v}] = (${oldWays} + ${ways[u]}) % MOD = ${ways[v]}`, en: `ways[${v}] = (${oldWays} + ${ways[u]}) % MOD = ${ways[v]}` },
          codeLine: 29,
          hlNodes: [u, v],
          hlEdges: [[u, v]],
          vars: [
            { name: "ways cũ", value: oldWays },
            { name: `ways[${u}]`, value: ways[u] },
            { name: "ways", value: waysStr() },
          ],
          note: {
            vi: `Hai nhóm đường khác nhau nhưng cùng ngắn nhất, nên cộng ${ways[u]} vào ${oldWays}. Không push heap vì dist[${v}] không đổi.`,
            en: `The route groups differ but are equally short, so add ${ways[u]} to ${oldWays}. Do not push because dist[${v}] did not change.`,
          },
        });
      }
    }
  }

  pushStep({
    title: { vi: "Heap đã rỗng", en: "The heap is empty" },
    codeLine: 18,
    vars: [
      { name: "dist", value: distStr() },
      { name: "ways", value: waysStr() },
    ],
    note: {
      vi: "Mọi shortest distance và số cách tương ứng đã được xử lý xong.",
      en: "All shortest distances and their corresponding path counts are complete.",
    },
  });

  const target = n - 1;
  const shortestNodes = new Set([target]);
  const shortestEdges = [];
  const stack = [target];
  while (stack.length) {
    const v = stack.pop();
    for (const u of predecessors[v]) {
      shortestEdges.push([u, v]);
      if (!shortestNodes.has(u)) {
        shortestNodes.add(u);
        stack.push(u);
      }
    }
  }
  const answer = ways[target] % MOD;
  pushStep({
    title: { vi: `Có ${answer} đường ngắn nhất tới node ${target}`, en: `${answer} shortest routes reach node ${target}` },
    codeLine: 30,
    hlNodes: [...shortestNodes],
    hlEdges: shortestEdges,
    final: true,
    vars: [
      { name: `dist[${target}]`, value: formatDist(dist[target]) },
      { name: `ways[${target}]`, value: ways[target] },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Trả ways[${target}] = ${answer}. Các cạnh màu nổi tạo thành toàn bộ DAG đường ngắn nhất; cạnh không thuộc bất kỳ đường ngắn nhất nào được làm mờ.`,
      en: `Return ways[${target}] = ${answer}. Highlighted edges form the full shortest-path DAG; every edge outside all shortest paths is dimmed.`,
    },
  });

  return { n, roads, answer, steps };
}

/**
 * LeetCode 1514: Path with Maximum Probability.
 * Dijkstra with a max-heap, where path weights are multiplied.
 */
function buildSteps1514(input, params) {
  const n = Number(params.n);
  const startNode = Number(params.start_node);
  const endNode = Number(params.end_node);
  const rawEdges = String(input).split(",").map((item) => item.trim()).filter(Boolean);
  const parsed = rawEdges.map((item) => item.split("-").map(Number));
  const valid = Number.isInteger(n) && n >= 2
    && Number.isInteger(startNode) && startNode >= 0 && startNode < n
    && Number.isInteger(endNode) && endNode >= 0 && endNode < n
    && parsed.length > 0
    && parsed.every(([a, b, probability]) => (
      Number.isInteger(a) && a >= 0 && a < n
      && Number.isInteger(b) && b >= 0 && b < n && a !== b
      && Number.isFinite(probability) && probability >= 0 && probability <= 1
    ));
  const steps = [];

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Nhập cạnh theo dạng a-b-probability, ngăn cách bằng dấu phẩy. Node phải nằm trong 0..n-1 và probability trong [0, 1].",
        en: "Enter edges as a-b-probability separated by commas. Nodes must be in 0..n-1 and probability in [0, 1].",
      },
    });
    return { n, edges: parsed, startNode, endNode, answer: 0, steps };
  }

  const nodes = Array.from({ length: n }, (_, id) => id);
  const edges = parsed.map(([u, v, w]) => ({ u, v, w, undirected: true }));
  const graph = Array.from({ length: n }, () => []);
  const best = new Array(n).fill(0);
  const parent = new Array(n).fill(-1);
  const finalized = new Set();
  const layout = make1514FlowLayout(n, startNode, endNode);
  const formatProb = (value) => {
    if (value === 0 || value === 1) return String(value);
    return String(Number(value.toFixed(5)));
  };
  const bestStr = () => `[${best.map(formatProb).join(", ")}]`;
  const heapStr = (heap) => `[${heap.map(([probability, node]) => `(-${formatProb(probability)}, ${node})`).join(", ")}]`;

  function makeGraph(hlNodes = [], hlEdges = [], annotations = {}) {
    return {
      nodes: nodes.map((id) => ({ id, label: String(id), dist: formatProb(best[id]) })),
      edges,
      hlNodes,
      hlEdges,
      visitedNodes: [...finalized],
      annotations: { [startNode]: "start", [endNode]: "end", ...annotations },
      ...layout,
    };
  }

  function pushStep({ title, codeLine, vars, note, hlNodes = [], hlEdges = [], annotations = {}, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(hlNodes, hlEdges, annotations),
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Tạo adjacency list vô hướng", en: "Create the undirected adjacency list" },
    codeLine: 7,
    vars: [{ name: "graph", value: "defaultdict(list)" }],
    note: {
      vi: "Mỗi cạnh [a, b] dùng được theo cả hai chiều, nên graph sẽ lưu b trong graph[a] và a trong graph[b].",
      en: "Each [a, b] edge works in both directions, so graph stores b under a and a under b.",
    },
  });

  for (const [a, b, probability] of parsed) {
    pushStep({
      title: { vi: `Đọc cạnh ${a} — ${b}`, en: `Read edge ${a} — ${b}` },
      codeLine: 8,
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      vars: [
        { name: "a, b", value: `${a}, ${b}` },
        { name: "probability", value: formatProb(probability) },
      ],
      note: {
        vi: `Cạnh vô hướng nối ${a} và ${b}, xác suất đi qua thành công là ${formatProb(probability)}.`,
        en: `The undirected edge connects ${a} and ${b} with success probability ${formatProb(probability)}.`,
      },
    });

    graph[a].push([b, probability]);
    pushStep({
      title: { vi: `Thêm ${a} → ${b}`, en: `Add ${a} → ${b}` },
      codeLine: 9,
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      vars: [{ name: `graph[${a}]`, value: `[${graph[a].map(([v, p]) => `(${v}, ${formatProb(p)})`).join(", ")}]` }],
      note: {
        vi: `Thêm (${b}, ${formatProb(probability)}) vào graph[${a}] cho chiều ${a} → ${b}.`,
        en: `Append (${b}, ${formatProb(probability)}) to graph[${a}] for direction ${a} → ${b}.`,
      },
    });

    graph[b].push([a, probability]);
    pushStep({
      title: { vi: `Thêm ${b} → ${a}`, en: `Add ${b} → ${a}` },
      codeLine: 10,
      hlNodes: [a, b],
      hlEdges: [[b, a]],
      vars: [{ name: `graph[${b}]`, value: `[${graph[b].map(([v, p]) => `(${v}, ${formatProb(p)})`).join(", ")}]` }],
      note: {
        vi: `Vì cạnh vô hướng, thêm chiều ngược (${a}, ${formatProb(probability)}) vào graph[${b}].`,
        en: `Because the edge is undirected, append reverse direction (${a}, ${formatProb(probability)}) to graph[${b}].`,
      },
    });
  }

  pushStep({
    title: { vi: "Khởi tạo best bằng 0", en: "Initialize best to 0" },
    codeLine: 12,
    vars: [{ name: "best", value: bestStr() }],
    note: {
      vi: "best[x] là xác suất lớn nhất đã biết để tới x. Giá trị 0 nghĩa là chưa tìm thấy đường nào.",
      en: "best[x] is the largest known probability of reaching x. Zero means no route has been found yet.",
    },
  });

  best[startNode] = 1;
  pushStep({
    title: { vi: `best[${startNode}] = 1`, en: `best[${startNode}] = 1` },
    codeLine: 13,
    hlNodes: [startNode],
    vars: [{ name: "best", value: bestStr() }],
    note: {
      vi: `Bắt đầu tại node ${startNode}; chưa đi qua cạnh nào nên xác suất vẫn là 1 (100%).`,
      en: `Start at node ${startNode}; no edge has been traversed, so probability is 1 (100%).`,
    },
  });

  const heap = [[1, startNode]];
  pushStep({
    title: { vi: "Đưa start vào max-heap", en: "Push start into the max-heap" },
    codeLine: 14,
    hlNodes: [startNode],
    vars: [{ name: "heap", value: heapStr(heap) }],
    note: {
      vi: "Python chỉ có min-heap, nên lưu xác suất âm. Giá trị -1 nhỏ nhất tương ứng xác suất thật 1 lớn nhất.",
      en: "Python has a min-heap, so probabilities are negated. The smallest value -1 represents the largest real probability 1.",
    },
  });

  let answer = 0;
  while (heap.length) {
    heap.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    pushStep({
      title: { vi: "Heap chưa rỗng", en: "The heap is not empty" },
      codeLine: 16,
      vars: [{ name: "heap", value: heapStr(heap) }],
      note: {
        vi: "Tiếp tục Dijkstra; trạng thái có xác suất thật lớn nhất sẽ được pop trước.",
        en: "Continue Dijkstra; the state with the largest real probability is popped first.",
      },
    });

    const [probability, u] = heap.shift();
    pushStep({
      title: { vi: `heappop → (-${formatProb(probability)}, ${u})`, en: `heappop → (-${formatProb(probability)}, ${u})` },
      codeLine: 17,
      hlNodes: [u],
      vars: [
        { name: "neg_prob", value: `-${formatProb(probability)}` },
        { name: "u", value: u },
        { name: "heap còn lại", value: heapStr(heap) },
      ],
      note: {
        vi: `Pop node ${u} với neg_prob = -${formatProb(probability)} từ heap.`,
        en: `Pop node ${u} with neg_prob = -${formatProb(probability)} from the heap.`,
      },
    });

    pushStep({
      title: { vi: `prob = ${formatProb(probability)}`, en: `prob = ${formatProb(probability)}` },
      codeLine: 18,
      hlNodes: [u],
      vars: [
        { name: "neg_prob", value: `-${formatProb(probability)}` },
        { name: "prob", value: formatProb(probability) },
      ],
      note: {
        vi: `Đổi dấu lại để lấy xác suất thật: -(-${formatProb(probability)}) = ${formatProb(probability)}.`,
        en: `Negate again to recover the real probability: -(-${formatProb(probability)}) = ${formatProb(probability)}.`,
      },
    });

    const stale = probability < best[u];
    pushStep({
      title: stale
        ? { vi: `${formatProb(probability)} < best[${u}]=${formatProb(best[u])}: bản ghi cũ`, en: `${formatProb(probability)} < best[${u}]=${formatProb(best[u])}: stale entry` }
        : { vi: `${formatProb(probability)} < best[${u}]? False`, en: `${formatProb(probability)} < best[${u}]? False` },
      codeLine: 19,
      hlNodes: [u],
      vars: [
        { name: "prob", value: formatProb(probability) },
        { name: `best[${u}]`, value: formatProb(best[u]) },
        { name: "condition", value: stale },
      ],
      note: stale
        ? {
            vi: `Đã có đường xác suất ${formatProb(best[u])} tốt hơn tới ${u}; bản ghi ${formatProb(probability)} đã cũ.`,
            en: `A better probability ${formatProb(best[u])} to ${u} already exists; ${formatProb(probability)} is stale.`,
          }
        : {
            vi: `Xác suất ${formatProb(probability)} vẫn khớp best[${u}], nên trạng thái này còn hợp lệ.`,
            en: `Probability ${formatProb(probability)} still matches best[${u}], so this state is valid.`,
          },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua bản ghi cũ", en: "Skip the stale entry" },
        codeLine: 20,
        hlNodes: [u],
        vars: [{ name: "continue", value: true }],
        note: {
          vi: "Không mở rộng hàng xóm từ xác suất kém hơn; quay lại đầu vòng while.",
          en: "Do not expand neighbors from a worse probability; return to the while loop.",
        },
      });
      continue;
    }

    const reachedEnd = u === endNode;
    pushStep({
      title: reachedEnd
        ? { vi: `u == end_node (${endNode}): True`, en: `u == end_node (${endNode}): True` }
        : { vi: `${u} chưa phải end_node ${endNode}`, en: `${u} is not end_node ${endNode}` },
      codeLine: 21,
      hlNodes: [u, endNode],
      vars: [
        { name: "u", value: u },
        { name: "end_node", value: endNode },
        { name: "condition", value: reachedEnd },
      ],
      note: reachedEnd
        ? {
            vi: "Đã pop được đích từ max-heap. Vì heap luôn ưu tiên xác suất lớn nhất, đây là đáp án tối ưu.",
            en: "The destination was popped from the max-heap. Since the heap prioritizes maximum probability, this is optimal.",
          }
        : {
            vi: `Node ${u} chưa phải đích; tiếp tục relax các cạnh kề.`,
            en: `Node ${u} is not the destination; continue relaxing adjacent edges.`,
          },
    });

    if (reachedEnd) {
      answer = probability;
      const pathNodes = [endNode];
      const pathEdges = [];
      let current = endNode;
      while (current !== startNode && parent[current] !== -1) {
        pathEdges.unshift([parent[current], current]);
        current = parent[current];
        pathNodes.unshift(current);
      }
      const pathText = pathNodes.join(" → ");
      pushStep({
        title: { vi: `Đường tốt nhất: ${pathText}`, en: `Best path: ${pathText}` },
        codeLine: 22,
        hlNodes: pathNodes,
        hlEdges: pathEdges,
        final: true,
        vars: [
          { name: "path", value: pathText },
          { name: "probability", value: formatProb(answer) },
        ],
        note: {
          vi: `Đường ${pathText} có xác suất ${formatProb(answer)}. Các cạnh không thuộc đường tối ưu được làm mờ.`,
          en: `Path ${pathText} has probability ${formatProb(answer)}. Edges outside the optimal path are dimmed.`,
        },
      });
      break;
    }

    finalized.add(u);
    for (const [v, edgeProb] of graph[u]) {
      pushStep({
        title: { vi: `Xét cạnh ${u} — ${v}`, en: `Inspect edge ${u} — ${v}` },
        codeLine: 24,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "v", value: v },
          { name: "edge_prob", value: formatProb(edgeProb) },
        ],
        note: {
          vi: `Thử đi từ ${u} sang ${v} qua cạnh có xác suất ${formatProb(edgeProb)}.`,
          en: `Try moving from ${u} to ${v} across an edge with probability ${formatProb(edgeProb)}.`,
        },
      });

      const newProb = probability * edgeProb;
      pushStep({
        title: { vi: `new_prob = ${formatProb(probability)} × ${formatProb(edgeProb)}`, en: `new_prob = ${formatProb(probability)} × ${formatProb(edgeProb)}` },
        codeLine: 25,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "prob", value: formatProb(probability) },
          { name: "edge_prob", value: formatProb(edgeProb) },
          { name: "new_prob", value: formatProb(newProb) },
        ],
        note: {
          vi: `Xác suất cả đường = xác suất tới ${u} × xác suất cạnh = ${formatProb(probability)} × ${formatProb(edgeProb)} = ${formatProb(newProb)}.`,
          en: `Whole-path probability = probability to ${u} × edge probability = ${formatProb(probability)} × ${formatProb(edgeProb)} = ${formatProb(newProb)}.`,
        },
      });

      const improves = newProb > best[v];
      pushStep({
        title: improves
          ? { vi: `${formatProb(newProb)} > best[${v}]=${formatProb(best[v])}`, en: `${formatProb(newProb)} > best[${v}]=${formatProb(best[v])}` }
          : { vi: `${formatProb(newProb)} > best[${v}]? False`, en: `${formatProb(newProb)} > best[${v}]? False` },
        codeLine: 26,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "new_prob", value: formatProb(newProb) },
          { name: `best[${v}]`, value: formatProb(best[v]) },
          { name: "condition", value: improves },
        ],
        note: improves
          ? {
              vi: `${formatProb(newProb)} lớn hơn xác suất đang lưu, nên tìm được đường tốt hơn tới ${v}.`,
              en: `${formatProb(newProb)} is larger than the stored probability, so a better route to ${v} was found.`,
            }
          : {
              vi: `${formatProb(newProb)} không lớn hơn ${formatProb(best[v])}; đường này không cải thiện best[${v}].`,
              en: `${formatProb(newProb)} is not larger than ${formatProb(best[v])}; this route does not improve best[${v}].`,
            },
      });

      if (!improves) continue;

      best[v] = newProb;
      parent[v] = u;
      pushStep({
        title: { vi: `best[${v}] = ${formatProb(newProb)}`, en: `best[${v}] = ${formatProb(newProb)}` },
        codeLine: 27,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [{ name: "best", value: bestStr() }],
        note: {
          vi: `Cập nhật xác suất tốt nhất tới node ${v} thành ${formatProb(newProb)}.`,
          en: `Update the best probability to node ${v} to ${formatProb(newProb)}.`,
        },
      });

      heap.push([newProb, v]);
      heap.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
      pushStep({
        title: { vi: `heappush((-${formatProb(newProb)}, ${v}))`, en: `heappush((-${formatProb(newProb)}, ${v}))` },
        codeLine: 28,
        hlNodes: [v],
        vars: [
          { name: "pushed", value: `(-${formatProb(newProb)}, ${v})` },
          { name: "heap", value: heapStr(heap) },
        ],
        note: {
          vi: `Push xác suất âm -${formatProb(newProb)} để min-heap hoạt động như max-heap.`,
          en: `Push negative probability -${formatProb(newProb)} so the min-heap behaves as a max-heap.`,
        },
      });
    }
  }

  if (!steps.at(-1).final) {
    pushStep({
      title: { vi: "Heap rỗng: không thể tới đích", en: "Heap empty: destination unreachable" },
      codeLine: 29,
      hlNodes: [endNode],
      final: true,
      vars: [
        { name: "heap", value: "[]" },
        { name: "answer", value: 0 },
      ],
      note: {
        vi: `Không có đường từ ${startNode} tới ${endNode}, nên trả 0.0.`,
        en: `There is no path from ${startNode} to ${endNode}, so return 0.0.`,
      },
    });
  }

  return { n, edges: parsed, startNode, endNode, answer, steps };
}

/**
 * LeetCode 778: Swim in Rising Water.
 * Dijkstra minimizes the maximum elevation visited along a grid path.
 */
function buildSteps778(input) {
  const grid = String(input)
    .split(/[|;]/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const n = grid.length;
  const values = grid.flat();
  const valid = n > 0 && n <= 20
    && grid.every((row) => row.length === n)
    && values.every((value) => Number.isInteger(value) && value >= 0 && value < n * n)
    && new Set(values).size === n * n;

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
        vi: "Grid phải là ma trận vuông n×n, chứa mỗi độ cao từ 0 tới n²-1 đúng một lần; hàng cách bởi '|' hoặc ';'. Visualization hỗ trợ n ≤ 20.",
        en: "The grid must be n×n and contain every elevation from 0 through n²-1 exactly once; separate rows with '|' or ';'. The visualization supports n ≤ 20.",
      },
    });
    return { grid, answer: -1, steps };
  }

  const best = Array.from({ length: n }, () => Array(n).fill(Infinity));
  const parent = Array.from({ length: n }, () => Array(n).fill(null));
  const finalized = new Set();
  const heap = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (r, c) => `${r},${c}`;
  const formatTime = (value) => Number.isFinite(value) ? String(value) : "∞";
  const bestStr = () => `[${best.map((row) => `[${row.map(formatTime).join(", ")}]`).join(", ")}]`;
  const heapStr = () => `[${heap.map(([time, r, c]) => `(${time}, ${r}, ${c})`).join(", ")}]`;

  function makeCells(current = null, pathCells = new Set()) {
    const queued = new Set(heap.map(([, r, c]) => key(r, c)));
    return grid.map((row, r) => row.map((height, c) => {
      const cellKey = key(r, c);
      let cls = "empty";
      if (finalized.has(cellKey)) cls = "visited";
      if (queued.has(cellKey)) cls = "queued";
      if (pathCells.has(cellKey)) cls = "path";
      if (current && current[0] === r && current[1] === c) cls = "current";
      const endpoint = r === 0 && c === 0
        ? " · S"
        : r === n - 1 && c === n - 1
          ? " · T"
          : "";
      return { label: String(height), meta: `t:${formatTime(best[r][c])}${endpoint}`, cls };
    }));
  }

  function pushStep({ title, codeLine, vars, note, current = null, pathCells, final = false }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows: n, cols: n, variant: "effort-grid", cells: makeCells(current, pathCells) },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: `Grid vuông có n = ${n}`, en: `The square grid has n = ${n}` },
    codeLine: 6,
    vars: [{ name: "n", value: n }],
    note: {
      vi: `Ta bơi từ (0,0) tới (${n - 1},${n - 1}). Mỗi giây, mực nước bằng t và chỉ có thể đứng trên ô có độ cao ≤ t.`,
      en: `Swim from (0,0) to (${n - 1},${n - 1}). At time t, water level is t, so only cells with elevation ≤ t are usable.`,
    },
  });

  pushStep({
    title: { vi: "Khởi tạo best bằng ∞", en: "Initialize best to ∞" },
    codeLine: 7,
    vars: [{ name: "best", value: bestStr() }],
    note: {
      vi: "best[r][c] là thời điểm sớm nhất đã biết có thể tới ô (r,c). ∞ nghĩa là chưa tìm thấy đường.",
      en: "best[r][c] is the earliest known time at which (r,c) is reachable. ∞ means no route is known.",
    },
  });

  best[0][0] = grid[0][0];
  pushStep({
    title: { vi: `best[0][0] = grid[0][0] = ${grid[0][0]}`, en: `best[0][0] = grid[0][0] = ${grid[0][0]}` },
    codeLine: 8,
    current: [0, 0],
    vars: [
      { name: "grid[0][0]", value: grid[0][0] },
      { name: "best[0][0]", value: best[0][0] },
    ],
    note: {
      vi: `Không thể bắt đầu trước khi nước đạt độ cao của ô đầu tiên, nên thời gian khởi đầu là ${grid[0][0]}, không phải luôn bằng 0.`,
      en: `Swimming cannot start before water reaches the first cell's elevation, so the initial time is ${grid[0][0]}, not always zero.`,
    },
  });

  heap.push([grid[0][0], 0, 0]);
  pushStep({
    title: { vi: "Đưa ô bắt đầu vào min-heap", en: "Push the start cell into the min-heap" },
    codeLine: 9,
    current: [0, 0],
    vars: [{ name: "heap", value: heapStr() }],
    note: {
      vi: "Heap lưu (time, row, col) và ưu tiên ô có thời gian tới sớm nhất.",
      en: "The heap stores (time, row, col) and prioritizes the earliest reachable cell.",
    },
  });

  pushStep({
    title: { vi: "Chuẩn bị bốn hướng", en: "Prepare four directions" },
    codeLine: 10,
    vars: [{ name: "directions", value: "[(1,0), (-1,0), (0,1), (0,-1)]" }],
    note: {
      vi: "Có thể bơi xuống, lên, phải hoặc trái; không đi chéo.",
      en: "Swimming may move down, up, right, or left, but not diagonally.",
    },
  });

  let answer = -1;
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    pushStep({
      title: { vi: "Heap chưa rỗng", en: "The heap is not empty" },
      codeLine: 12,
      vars: [{ name: "heap", value: heapStr() }],
      note: {
        vi: "Tiếp tục Dijkstra; trạng thái có time nhỏ nhất sẽ được pop trước.",
        en: "Continue Dijkstra; the state with the smallest time is popped first.",
      },
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
      note: {
        vi: `Ô (${r},${c}) được chọn vì có thời gian tới ${time}, nhỏ nhất trong heap.`,
        en: `Cell (${r},${c}) is selected because its arrival time ${time} is the smallest in the heap.`,
      },
    });

    const stale = time > best[r][c];
    pushStep({
      title: stale
        ? { vi: `${time} > best[${r}][${c}]=${best[r][c]}: stale`, en: `${time} > best[${r}][${c}]=${best[r][c]}: stale` }
        : { vi: `${time} > best[${r}][${c}]? False`, en: `${time} > best[${r}][${c}]? False` },
      codeLine: 14,
      current: [r, c],
      vars: [
        { name: "time", value: time },
        { name: `best[${r}][${c}]`, value: best[r][c] },
        { name: "condition", value: stale },
      ],
      note: stale
        ? {
            vi: "Một đường tốt hơn đã cập nhật ô này; bản ghi vừa pop đã cũ và không được mở rộng.",
            en: "A better route already updated this cell; the popped entry is stale and must not expand.",
          }
        : {
            vi: "time vẫn khớp thời gian tốt nhất của ô, nên trạng thái còn hợp lệ.",
            en: "time still matches the cell's best arrival time, so this state is valid.",
          },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua stale entry", en: "Skip the stale entry" },
        codeLine: 15,
        current: [r, c],
        vars: [{ name: "continue", value: true }],
        note: {
          vi: "Quay lại đầu vòng while, không xét hàng xóm từ một đường chậm hơn.",
          en: "Return to the while loop without exploring neighbors from a slower route.",
        },
      });
      continue;
    }

    finalized.add(key(r, c));
    const reachedTarget = r === n - 1 && c === n - 1;
    pushStep({
      title: reachedTarget
        ? { vi: `(${r},${c}) là ô đích`, en: `(${r},${c}) is the target` }
        : { vi: `(${r},${c}) chưa phải ô đích`, en: `(${r},${c}) is not the target` },
      codeLine: 16,
      current: [r, c],
      vars: [
        { name: "current", value: `(${r}, ${c})` },
        { name: "target", value: `(${n - 1}, ${n - 1})` },
        { name: "condition", value: reachedTarget },
      ],
      note: reachedTarget
        ? {
            vi: "Đích được pop với time nhỏ nhất toàn heap, nên đây là thời điểm sớm nhất chắc chắn có thể tới đích.",
            en: "The target was popped with the heap's smallest time, so this is the earliest guaranteed arrival.",
          }
        : {
            vi: "Chưa tới đích; tiếp tục thử bốn ô kề.",
            en: "The target has not been reached; inspect four adjacent cells.",
          },
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
      const pathText = path.map(([pr, pc]) => `(${pr},${pc})`).join(" → ");
      pushStep({
        title: { vi: `Thời gian nhỏ nhất = ${answer}`, en: `Minimum time = ${answer}` },
        codeLine: 17,
        pathCells,
        final: true,
        vars: [
          { name: "path", value: pathText },
          { name: "max elevation", value: answer },
          { name: "answer", value: answer },
        ],
        note: {
          vi: `Đường xanh lá: ${pathText}. Ô cao nhất trên đường có độ cao ${answer}, nên phải chờ tới t=${answer}; không có đường nào cần chờ ít hơn.`,
          en: `Green path: ${pathText}. Its highest cell has elevation ${answer}, so swimming must wait until t=${answer}; no route can wait less.`,
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
        note: {
          vi: `Từ (${r},${c}), áp dụng độ lệch hàng ${dr} và cột ${dc}.`,
          en: `From (${r},${c}), apply row offset ${dr} and column offset ${dc}.`,
        },
      });

      const nr = r + dr;
      const nc = c + dc;
      pushStep({
        title: { vi: `Ô kế tiếp = (${nr},${nc})`, en: `Next cell = (${nr},${nc})` },
        codeLine: 20,
        current: [r, c],
        vars: [
          { name: "nr", value: `${r} + (${dr}) = ${nr}` },
          { name: "nc", value: `${c} + (${dc}) = ${nc}` },
        ],
        note: {
          vi: "Tính tọa độ hàng xóm bằng nr = r + dr và nc = c + dc.",
          en: "Compute the neighbor with nr = r + dr and nc = c + dc.",
        },
      });

      const inBounds = nr >= 0 && nr < n && nc >= 0 && nc < n;
      pushStep({
        title: inBounds
          ? { vi: `(${nr},${nc}) nằm trong grid`, en: `(${nr},${nc}) is inside the grid` }
          : { vi: `(${nr},${nc}) vượt biên`, en: `(${nr},${nc}) is out of bounds` },
        codeLine: 21,
        current: inBounds ? [nr, nc] : [r, c],
        vars: [
          { name: "neighbor", value: `(${nr}, ${nc})` },
          { name: "in bounds", value: inBounds },
        ],
        note: inBounds
          ? {
              vi: "Tọa độ hợp lệ; có thể tính thời gian cần để bước vào ô này.",
              en: "The coordinates are valid; compute the time required to enter this cell.",
            }
          : {
              vi: "Tọa độ ngoài ma trận; bỏ qua thân if và thử hướng tiếp theo.",
              en: "The coordinates are outside the matrix; skip the if body and try the next direction.",
            },
      });
      if (!inBounds) continue;

      const newTime = Math.max(time, grid[nr][nc]);
      pushStep({
        title: { vi: `new_time = max(${time}, ${grid[nr][nc]}) = ${newTime}`, en: `new_time = max(${time}, ${grid[nr][nc]}) = ${newTime}` },
        codeLine: 22,
        current: [nr, nc],
        vars: [
          { name: "time", value: time },
          { name: `grid[${nr}][${nc}]`, value: grid[nr][nc] },
          { name: "new_time", value: newTime },
        ],
        note: {
          vi: `Muốn đi cả đường tới (${nr},${nc}), nước phải phủ mọi ô đã qua. Vì vậy lấy độ cao lớn nhất: max(${time}, ${grid[nr][nc]}) = ${newTime}, không cộng hai số.`,
          en: `To traverse the whole route to (${nr},${nc}), water must cover every visited cell. Take the maximum elevation: max(${time}, ${grid[nr][nc]}) = ${newTime}, not their sum.`,
        },
      });

      const oldBest = best[nr][nc];
      const improves = newTime < oldBest;
      pushStep({
        title: improves
          ? { vi: `${newTime} < ${formatTime(oldBest)}: tới sớm hơn`, en: `${newTime} < ${formatTime(oldBest)}: earlier arrival` }
          : { vi: `${newTime} < ${formatTime(oldBest)}? False`, en: `${newTime} < ${formatTime(oldBest)}? False` },
        codeLine: 23,
        current: [nr, nc],
        vars: [
          { name: "new_time", value: newTime },
          { name: `best[${nr}][${nc}]`, value: formatTime(oldBest) },
          { name: "condition", value: improves },
        ],
        note: improves
          ? {
              vi: `Đường mới giảm thời điểm tới (${nr},${nc}) từ ${formatTime(oldBest)} xuống ${newTime}.`,
              en: `The new route lowers (${nr},${nc})'s arrival time from ${formatTime(oldBest)} to ${newTime}.`,
            }
          : {
              vi: `Ô (${nr},${nc}) đã có đường tới lúc ${formatTime(oldBest)}, không chậm hơn ${newTime}; giữ nguyên.`,
              en: `Cell (${nr},${nc}) is already reachable at ${formatTime(oldBest)}, no later than ${newTime}; keep it.`,
            },
      });
      if (!improves) continue;

      best[nr][nc] = newTime;
      parent[nr][nc] = [r, c];
      pushStep({
        title: { vi: `best[${nr}][${nc}] = ${newTime}`, en: `best[${nr}][${nc}] = ${newTime}` },
        codeLine: 24,
        current: [nr, nc],
        vars: [{ name: "best", value: bestStr() }],
        note: {
          vi: `Lưu thời gian tốt hơn cho (${nr},${nc}). Visualization cũng nhớ parent = (${r},${c}) để dựng đường cuối.`,
          en: `Store the better time for (${nr},${nc}). The visualization also records parent = (${r},${c}) for the final path.`,
        },
      });

      heap.push([newTime, nr, nc]);
      heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
      pushStep({
        title: { vi: `Push (${newTime}, ${nr}, ${nc})`, en: `Push (${newTime}, ${nr}, ${nc})` },
        codeLine: 25,
        current: [nr, nc],
        vars: [{ name: "heap", value: heapStr() }],
        note: {
          vi: "Đưa trạng thái mới vào heap để Dijkstra tiếp tục ưu tiên thời gian nhỏ nhất.",
          en: "Push the new state so Dijkstra continues prioritizing the smallest time.",
        },
      });
    }
  }

  if (!steps.at(-1).final) {
    pushStep({
      title: { vi: "Không thể tới đích", en: "The target is unreachable" },
      codeLine: 26,
      final: true,
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Dòng fallback trả -1. Với grid hợp lệ, mọi ô nối nhau theo bốn hướng nên thuật toán luôn trả ở dòng 17.",
        en: "The fallback returns -1. In a valid grid all cells connect through four directions, so line 17 always returns first.",
      },
    });
  }

  return { grid, answer, steps };
}

/**
 * LeetCode 1631: Path With Minimum Effort.
 * Dijkstra on a grid where a path's cost is its largest edge difference.
 */
function buildSteps1631(input) {
  const heights = String(input)
    .split(/[|;]/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const valid = heights.length > 0
    && heights[0].length > 0
    && heights.length <= 100
    && heights[0].length <= 100
    && heights.every((row) => row.length === heights[0].length
      && row.every((value) => Number.isInteger(value) && value >= 1));

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, variant: "effort-grid", cells: [[{ label: "!", meta: "invalid", cls: "current" }]] },
      highlight: [],
      mark: [],
      final: true,
      codeBlock: 2,
      codeLines: [6],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Nhập ma trận số nguyên dương hình chữ nhật; các hàng cách nhau bởi '|', các số cách nhau bởi dấu phẩy. Ví dụ: 1,2,2|3,8,2|5,3,5.",
        en: "Enter a rectangular matrix of positive integers; separate rows with '|' and values with commas. Example: 1,2,2|3,8,2|5,3,5.",
      },
    });
    return { heights, answer: 0, steps };
  }

  const rows = heights.length;
  const cols = heights[0].length;
  const effort = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const finalized = new Set();
  const heap = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (r, c) => `${r},${c}`;
  const formatEffort = (value) => Number.isFinite(value) ? String(value) : "∞";
  const effortStr = () => `[${effort.map((row) => `[${row.map(formatEffort).join(", ")}]`).join(", ")}]`;
  const heapStr = () => `[${heap.map(([value, r, c]) => `(${value}, ${r}, ${c})`).join(", ")}]`;

  function makeCells(current = null, pathCells = new Set(), neighbor = null) {
    const queued = new Set(heap.map(([, r, c]) => key(r, c)));
    return heights.map((row, r) => row.map((height, c) => {
      const cellKey = key(r, c);
      let cls = "empty";
      if (finalized.has(cellKey)) cls = "visited";
      if (queued.has(cellKey)) cls = "queued";
      if (neighbor && neighbor[0] === r && neighbor[1] === c) cls = "neighbor";
      if (current && current[0] === r && current[1] === c) cls = "current";
      if (pathCells.has(cellKey)) cls = "path";
      const endpoint = r === 0 && c === 0
        ? "S"
        : r === rows - 1 && c === cols - 1
          ? "T"
          : "";
      return {
        label: String(height),
        meta: `best:${formatEffort(effort[r][c])}`,
        coord: `${r},${c}`,
        endpoint,
        cls,
      };
    }));
  }

  function pushStep({
    title, codeLine, vars, note, current = null, neighbor = null, pathCells,
    event = "init", direction = null, curEffort = null, edgeEffort = null,
    newEffort = null, oldEffort = null, improves = null, path = [], pathEdges = [],
    answerValue = null, final = false,
  }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, variant: "effort-grid", cells: makeCells(current, pathCells, neighbor) },
      effortView: {
        event,
        heights: heights.map((row) => [...row]),
        best: effort.map((row) => row.map(formatEffort)),
        heap: heap.map(([value, hr, hc]) => [value, hr, hc]),
        finalized: [...finalized].map((cellKey) => cellKey.split(",").map(Number)),
        current: current ? [...current] : null,
        neighbor: neighbor ? [...neighbor] : null,
        target: [rows - 1, cols - 1],
        direction: direction ? [...direction] : null,
        curEffort,
        edgeEffort,
        newEffort,
        oldEffort: oldEffort === null ? null : formatEffort(oldEffort),
        improves,
        path: path.map((cell) => [...cell]),
        pathEdges: pathEdges.map((edge) => ({ from: [...edge.from], to: [...edge.to], diff: edge.diff })),
        answer: answerValue,
      },
      highlight: [],
      mark: [],
      final,
      codeBlock: 2,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: `Kích thước grid: ${rows} × ${cols}`, en: `Grid size: ${rows} × ${cols}` },
    codeLine: 6,
    event: "init",
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi: "Mỗi ô là một node. Từ một ô có thể đi sang tối đa 4 node kề: dưới, trên, phải và trái.",
      en: "Each cell is a node. A cell can move to up to four adjacent nodes: down, up, right, and left.",
    },
  });

  pushStep({
    title: { vi: "Khởi tạo mọi effort bằng ∞", en: "Initialize every effort to ∞" },
    codeLine: 7,
    event: "init",
    vars: [{ name: "effort", value: effortStr() }],
    note: {
      vi: "effort[r][c] là effort nhỏ nhất đã biết để tới ô (r,c). ∞ nghĩa là chưa tìm thấy đường tới ô đó.",
      en: "effort[r][c] is the smallest known effort to reach (r,c). ∞ means no route has reached it yet.",
    },
  });

  effort[0][0] = 0;
  pushStep({
    title: { vi: "Ô bắt đầu có effort = 0", en: "The start cell has effort 0" },
    codeLine: 8,
    current: [0, 0],
    event: "start",
    curEffort: 0,
    vars: [{ name: "effort[0][0]", value: 0 }],
    note: {
      vi: "Đứng tại ô bắt đầu và chưa đi qua cạnh nào, nên chênh lệch lớn nhất hiện tại bằng 0.",
      en: "At the start no edge has been traversed, so the current maximum difference is 0.",
    },
  });

  heap.push([0, 0, 0]);
  pushStep({
    title: { vi: "Đưa ô bắt đầu vào min-heap", en: "Push the start into the min-heap" },
    codeLine: 9,
    current: [0, 0],
    event: "push",
    curEffort: 0,
    vars: [{ name: "heap", value: heapStr() }],
    note: {
      vi: "Heap lưu (effort, row, col) và luôn pop trạng thái có effort nhỏ nhất trước.",
      en: "The heap stores (effort, row, col) and always pops the smallest effort first.",
    },
  });

  pushStep({
    title: { vi: "Chuẩn bị 4 hướng di chuyển", en: "Prepare four movement directions" },
    codeLine: 10,
    event: "init",
    vars: [{ name: "directions", value: "[(1,0), (-1,0), (0,1), (0,-1)]" }],
    note: {
      vi: "Mỗi cặp (dr, dc) thay đổi hàng và cột để lần lượt thử xuống, lên, phải, trái.",
      en: "Each (dr, dc) changes row and column to try down, up, right, and left.",
    },
  });

  let answer = 0;
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    pushStep({
      title: { vi: "Heap chưa rỗng", en: "The heap is not empty" },
      codeLine: 12,
      event: "heap",
      vars: [{ name: "heap", value: heapStr() }],
      note: {
        vi: "Vẫn còn trạng thái cần xử lý; phần tử đầu heap có effort nhỏ nhất.",
        en: "States remain to process; the first heap entry has the smallest effort.",
      },
    });

    const [curEffort, r, c] = heap.shift();
    pushStep({
      title: { vi: `Pop ô (${r},${c}) với effort ${curEffort}`, en: `Pop cell (${r},${c}) with effort ${curEffort}` },
      codeLine: 13,
      current: [r, c],
      event: "pop",
      curEffort,
      vars: [
        { name: "cur_effort", value: curEffort },
        { name: "r, c", value: `${r}, ${c}` },
        { name: "heap còn lại", value: heapStr() },
      ],
      note: {
        vi: `Dijkstra chọn ô (${r},${c}) vì trạng thái này đang có effort nhỏ nhất trong heap.`,
        en: `Dijkstra selects (${r},${c}) because this state has the smallest effort in the heap.`,
      },
    });

    const stale = curEffort > effort[r][c];
    pushStep({
      title: stale
        ? { vi: `${curEffort} > effort[${r}][${c}]=${effort[r][c]}: bản ghi cũ`, en: `${curEffort} > effort[${r}][${c}]=${effort[r][c]}: stale entry` }
        : { vi: `${curEffort} > effort[${r}][${c}]? False`, en: `${curEffort} > effort[${r}][${c}]? False` },
      codeLine: 14,
      current: [r, c],
      event: "stale",
      curEffort,
      vars: [
        { name: "cur_effort", value: curEffort },
        { name: `effort[${r}][${c}]`, value: effort[r][c] },
        { name: "condition", value: stale },
      ],
      note: stale
        ? {
            vi: "Một đường tốt hơn đã cập nhật ô này sau khi bản ghi hiện tại được push, nên bản ghi vừa pop đã cũ.",
            en: "A better route updated this cell after this entry was pushed, so the popped entry is stale.",
          }
        : {
            vi: "Giá trị vừa pop vẫn bằng effort tốt nhất đang lưu, nên trạng thái còn hợp lệ.",
            en: "The popped value still matches the stored best effort, so the state is valid.",
          },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua bản ghi cũ", en: "Skip the stale entry" },
        codeLine: 15,
        current: [r, c],
        event: "stale",
        curEffort,
        vars: [{ name: "continue", value: true }],
        note: {
          vi: "Không mở rộng hàng xóm từ một đường kém hơn; quay lại đầu vòng while.",
          en: "Do not expand neighbors from a worse route; return to the while loop.",
        },
      });
      continue;
    }

    finalized.add(key(r, c));
    const reachedTarget = r === rows - 1 && c === cols - 1;
    pushStep({
      title: reachedTarget
        ? { vi: `(${r},${c}) là ô đích`, en: `(${r},${c}) is the target` }
        : { vi: `(${r},${c}) chưa phải ô đích`, en: `(${r},${c}) is not the target` },
      codeLine: 16,
      current: [r, c],
      event: "target",
      curEffort,
      vars: [
        { name: "current", value: `(${r}, ${c})` },
        { name: "target", value: `(${rows - 1}, ${cols - 1})` },
        { name: "condition", value: reachedTarget },
      ],
      note: reachedTarget
        ? {
            vi: "Đích được pop với effort nhỏ nhất trong toàn bộ heap, vì vậy giá trị này đã tối ưu và có thể trả ngay.",
            en: "The target was popped with the smallest effort in the heap, so this value is optimal and can be returned immediately.",
          }
        : {
            vi: "Chưa tới đích; tiếp tục thử bốn ô kề để tìm các đường tốt hơn.",
            en: "The target has not been reached; inspect four neighbors for better routes.",
          },
    });

    if (reachedTarget) {
      answer = curEffort;
      const path = [];
      let current = [r, c];
      while (current) {
        path.unshift(current);
        current = parent[current[0]][current[1]];
      }
      const pathCells = new Set(path.map(([pr, pc]) => key(pr, pc)));
      const pathEdges = path.slice(1).map(([toR, toC], index) => {
        const [fromR, fromC] = path[index];
        return {
          from: [fromR, fromC],
          to: [toR, toC],
          diff: Math.abs(heights[fromR][fromC] - heights[toR][toC]),
        };
      });
      const pathText = path.map(([pr, pc]) => `(${pr},${pc})`).join(" → ");
      pushStep({
        title: { vi: `Effort nhỏ nhất = ${answer}`, en: `Minimum effort = ${answer}` },
        codeLine: 17,
        event: "done",
        current: [r, c],
        curEffort,
        pathCells,
        path,
        pathEdges,
        answerValue: answer,
        final: true,
        vars: [{ name: "path", value: pathText }, { name: "answer", value: answer }],
        note: {
          vi: `Đường màu xanh lá: ${pathText}. Chênh lệch lớn nhất trên đường này là ${answer}; không đường nào có thể đạt effort nhỏ hơn. parent chỉ được visualization ghi lại để tô đường cuối, không làm thay đổi thuật toán.`,
          en: `Green path: ${pathText}. Its largest edge difference is ${answer}, and no route can have a smaller effort. The visualization records parent only to highlight the final path; it does not change the algorithm.`,
        },
      });
      break;
    }

    for (const [dr, dc] of directions) {
      pushStep({
        title: { vi: `Lấy hướng (${dr},${dc})`, en: `Take direction (${dr},${dc})` },
        codeLine: 19,
        current: [r, c],
        event: "direction",
        direction: [dr, dc],
        curEffort,
        vars: [{ name: "dr, dc", value: `${dr}, ${dc}` }],
        note: {
          vi: `Từ ô (${r},${c}), áp dụng độ lệch hàng ${dr} và cột ${dc}.`,
          en: `From (${r},${c}), apply row offset ${dr} and column offset ${dc}.`,
        },
      });

      const nr = r + dr;
      const nc = c + dc;
      pushStep({
        title: { vi: `Ô kế tiếp = (${nr},${nc})`, en: `Next cell = (${nr},${nc})` },
        codeLine: 20,
        current: [r, c],
        neighbor: [nr, nc],
        event: "neighbor",
        direction: [dr, dc],
        curEffort,
        vars: [
          { name: "nr", value: `${r} + (${dr}) = ${nr}` },
          { name: "nc", value: `${c} + (${dc}) = ${nc}` },
        ],
        note: {
          vi: `Tính tọa độ hàng xóm: nr = r + dr và nc = c + dc.`,
          en: "Compute the neighbor coordinates with nr = r + dr and nc = c + dc.",
        },
      });

      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      pushStep({
        title: inBounds
          ? { vi: `(${nr},${nc}) nằm trong grid`, en: `(${nr},${nc}) is inside the grid` }
          : { vi: `(${nr},${nc}) vượt biên`, en: `(${nr},${nc}) is out of bounds` },
        codeLine: 21,
        current: [r, c],
        neighbor: [nr, nc],
        event: "bounds",
        direction: [dr, dc],
        curEffort,
        vars: [
          { name: "neighbor", value: `(${nr}, ${nc})` },
          { name: "in bounds", value: inBounds },
        ],
        note: inBounds
          ? {
              vi: "Tọa độ hợp lệ, nên có thể tính effort của cạnh nối hai ô.",
              en: "The coordinates are valid, so the connecting edge effort can be computed.",
            }
          : {
              vi: "Tọa độ nằm ngoài ma trận; khối if không chạy và vòng for chuyển sang hướng tiếp theo.",
              en: "The coordinates are outside the matrix; the if body is skipped and the loop tries the next direction.",
            },
      });
      if (!inBounds) continue;

      const edgeEffort = Math.abs(heights[r][c] - heights[nr][nc]);
      pushStep({
        title: { vi: `Chênh lệch cạnh = |${heights[r][c]} - ${heights[nr][nc]}| = ${edgeEffort}`, en: `Edge difference = |${heights[r][c]} - ${heights[nr][nc]}| = ${edgeEffort}` },
        codeLine: 22,
        current: [r, c],
        neighbor: [nr, nc],
        event: "edge",
        direction: [dr, dc],
        curEffort,
        edgeEffort,
        vars: [
          { name: `heights[${r}][${c}]`, value: heights[r][c] },
          { name: `heights[${nr}][${nc}]`, value: heights[nr][nc] },
          { name: "edge_effort", value: edgeEffort },
        ],
        note: {
          vi: "Chi phí riêng của bước đi này là trị tuyệt đối chênh lệch độ cao giữa hai ô kề.",
          en: "The cost of this move is the absolute height difference between the adjacent cells.",
        },
      });

      const newEffort = Math.max(curEffort, edgeEffort);
      pushStep({
        title: { vi: `new_effort = max(${curEffort}, ${edgeEffort}) = ${newEffort}`, en: `new_effort = max(${curEffort}, ${edgeEffort}) = ${newEffort}` },
        codeLine: 23,
        current: [r, c],
        neighbor: [nr, nc],
        event: "relax",
        direction: [dr, dc],
        curEffort,
        edgeEffort,
        newEffort,
        vars: [
          { name: "cur_effort", value: curEffort },
          { name: "edge_effort", value: edgeEffort },
          { name: "new_effort", value: newEffort },
        ],
        note: {
          vi: `Effort của cả đường không phải tổng. Nó là cạnh chênh lệch lớn nhất đã gặp, nên lấy max(${curEffort}, ${edgeEffort}) = ${newEffort}.`,
          en: `A path's effort is not a sum. It is the largest edge difference seen, so take max(${curEffort}, ${edgeEffort}) = ${newEffort}.`,
        },
      });

      const oldEffort = effort[nr][nc];
      const improves = newEffort < oldEffort;
      pushStep({
        title: improves
          ? { vi: `${newEffort} < ${formatEffort(oldEffort)}: tìm thấy đường tốt hơn`, en: `${newEffort} < ${formatEffort(oldEffort)}: found a better route` }
          : { vi: `${newEffort} < ${formatEffort(oldEffort)}? False`, en: `${newEffort} < ${formatEffort(oldEffort)}? False` },
        codeLine: 24,
        current: [r, c],
        neighbor: [nr, nc],
        event: "compare",
        direction: [dr, dc],
        curEffort,
        edgeEffort,
        newEffort,
        oldEffort,
        improves,
        vars: [
          { name: "new_effort", value: newEffort },
          { name: `effort[${nr}][${nc}]`, value: formatEffort(oldEffort) },
          { name: "condition", value: improves },
        ],
        note: improves
          ? {
              vi: `Đường mới giảm effort tốt nhất của ô (${nr},${nc}) từ ${formatEffort(oldEffort)} xuống ${newEffort}.`,
              en: `The new route lowers the best effort for (${nr},${nc}) from ${formatEffort(oldEffort)} to ${newEffort}.`,
            }
          : {
              vi: `Ô (${nr},${nc}) đã có đường với effort ${formatEffort(oldEffort)}, không tệ hơn ${newEffort}; không cập nhật.`,
              en: `Cell (${nr},${nc}) already has effort ${formatEffort(oldEffort)}, no worse than ${newEffort}; do not update.`,
            },
      });
      if (!improves) continue;

      effort[nr][nc] = newEffort;
      parent[nr][nc] = [r, c];
      pushStep({
        title: { vi: `Cập nhật effort[${nr}][${nc}] = ${newEffort}`, en: `Set effort[${nr}][${nc}] = ${newEffort}` },
        codeLine: 25,
        current: [r, c],
        neighbor: [nr, nc],
        event: "update",
        direction: [dr, dc],
        curEffort,
        edgeEffort,
        newEffort,
        oldEffort,
        improves,
        vars: [{ name: "effort", value: effortStr() }],
        note: {
          vi: `Lưu effort tốt hơn cho ô (${nr},${nc}). Visualization đồng thời nhớ parent = (${r},${c}) để dựng đường cuối.`,
          en: `Store the better effort for (${nr},${nc}). The visualization also records parent = (${r},${c}) to reconstruct the final route.`,
        },
      });

      heap.push([newEffort, nr, nc]);
      heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
      pushStep({
        title: { vi: `Push (${newEffort}, ${nr}, ${nc}) vào heap`, en: `Push (${newEffort}, ${nr}, ${nc}) into the heap` },
        codeLine: 26,
        current: [r, c],
        neighbor: [nr, nc],
        event: "push",
        direction: [dr, dc],
        curEffort,
        edgeEffort,
        newEffort,
        oldEffort,
        improves,
        vars: [{ name: "heap", value: heapStr() }],
        note: {
          vi: "Heap sẽ sắp xếp để trạng thái có effort nhỏ nhất được xử lý trước ở vòng lặp tiếp theo.",
          en: "The heap orders states so the smallest effort is processed first in a later iteration.",
        },
      });
    }
  }

  if (!steps.at(-1).final) {
    pushStep({
      title: { vi: "Grid không có ô để xử lý", en: "No grid cell to process" },
      codeLine: 27,
      event: "done",
      answerValue: 0,
      final: true,
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Dòng fallback trả 0; với grid hợp lệ, mọi ô luôn nối được bằng bốn hướng nên thuật toán sẽ trả ở dòng 17.",
        en: "The fallback returns 0; in a valid grid every cell is connected by four-direction moves, so line 17 returns first.",
      },
    });
  }

  return { heights, answer, steps };
}

/**
 * Generate steps for LeetCode 851: Loud and Rich.
 * DFS on reversed richer graph: for each node, find the quietest person among all richer people.
 */
function buildSteps851Legacy(input, params) {
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

function buildSteps851(input, params = {}) {
  const richerRaw = String(input).split(",").map((edge) => edge.trim()).filter(Boolean);
  const quiet = String(params.quiet || "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter(Number.isFinite);
  const n = quiet.length;
  const steps = [];
  const answer = new Array(n).fill(-1);
  const graph = Array.from({ length: n }, () => []);
  const doneNodes = new Set();
  const builtEdgeKeys = new Set();
  const richerEdges = richerRaw.map((edge, index) => {
    const [richer, poorer] = edge.split("-").map(Number);
    return {
      key: `${index}:${richer}-${poorer}`,
      richer,
      poorer,
      from: poorer,
      to: richer,
    };
  }).filter((edge) => Number.isInteger(edge.richer) && Number.isInteger(edge.poorer) && edge.richer >= 0 && edge.richer < n && edge.poorer >= 0 && edge.poorer < n);

  const copyEdge = (edge) => edge ? { ...edge } : null;
  const answerText = () => `[${answer.join(", ")}]`;

  function pushStep({
    title,
    note,
    codeLines,
    event,
    phase,
    callStack = [],
    currentNode = null,
    neighbor = null,
    currentBuildEdge = null,
    activeEdge = null,
    currentBestPerson = null,
    candidatePerson = null,
    willUpdate = null,
    changedPerson = null,
    outerIndex = null,
    final = false,
    vars = [],
  }) {
    steps.push({
      title,
      note,
      codeLines,
      arr: [],
      highlight: [],
      mark: [],
      final,
      vars,
      loudRichView: {
        event,
        phase,
        n,
        quiet: [...quiet],
        richerEdges: richerEdges.map(copyEdge),
        builtEdgeKeys: [...builtEdgeKeys],
        graph: graph.map((neighbors) => [...neighbors]),
        answer: [...answer],
        doneNodes: [...doneNodes],
        callStack: [...callStack],
        currentNode,
        neighbor,
        currentBuildEdge: copyEdge(currentBuildEdge),
        activeEdge: activeEdge ? [...activeEdge] : null,
        currentBestPerson,
        candidatePerson,
        currentBestQuiet: currentBestPerson === null ? null : quiet[currentBestPerson],
        candidateQuiet: candidatePerson === null ? null : quiet[candidatePerson],
        willUpdate,
        changedPerson,
        outerIndex,
      },
    });
  }

  pushStep({
    title: { vi: `Có ${n} người, đọc quiet[]`, en: `Read quiet[] for ${n} people` },
    note: {
      vi: "quiet[i] càng nhỏ thì người i càng ít ồn. Mỗi người ban đầu chưa có kết quả nên answer[i] = -1.",
      en: "A smaller quiet[i] means person i is quieter. Every answer starts unknown at -1.",
    },
    codeLines: [3],
    event: "init",
    phase: "build",
    vars: [{ name: "n", value: n }, { name: "quiet", value: `[${quiet.join(", ")}]` }],
  });

  pushStep({
    title: { vi: "Tạo reversed graph rỗng", en: "Create an empty reversed graph" },
    note: {
      vi: "Ta lưu cạnh poorer → richer để từ một người có thể DFS trực tiếp tới tất cả người giàu hơn.",
      en: "Store poorer → richer edges so DFS can move directly from a person to everyone richer.",
    },
    codeLines: [4],
    event: "init-graph",
    phase: "build",
    vars: [{ name: "graph", value: `{${graph.map((_, index) => `${index}:[]`).join(", ")}}` }],
  });

  for (let edgeIndex = 0; edgeIndex < richerEdges.length; edgeIndex++) {
    const edge = richerEdges[edgeIndex];
    pushStep({
      title: { vi: `Đọc richer[${edgeIndex}] = [${edge.richer}, ${edge.poorer}]`, en: `Read richer[${edgeIndex}] = [${edge.richer}, ${edge.poorer}]` },
      note: {
        vi: `Người ${edge.richer} giàu hơn người ${edge.poorer}. Ta sẽ đảo hướng lưu thành ${edge.poorer} → ${edge.richer}.`,
        en: `Person ${edge.richer} is richer than person ${edge.poorer}. Store the reversed direction ${edge.poorer} → ${edge.richer}.`,
      },
      codeLines: [5],
      event: "read-edge",
      phase: "build",
      currentBuildEdge: edge,
      vars: [{ name: "a, b", value: `${edge.richer}, ${edge.poorer}` }],
    });

    graph[edge.poorer].push(edge.richer);
    builtEdgeKeys.add(edge.key);
    pushStep({
      title: { vi: `graph[${edge.poorer}].append(${edge.richer})`, en: `graph[${edge.poorer}].append(${edge.richer})` },
      note: {
        vi: `DFS(${edge.poorer}) giờ có thể đi tới người giàu hơn ${edge.richer}.`,
        en: `DFS(${edge.poorer}) can now move to richer person ${edge.richer}.`,
      },
      codeLines: [6],
      event: "add-edge",
      phase: "build",
      currentBuildEdge: edge,
      vars: [{ name: `graph[${edge.poorer}]`, value: `[${graph[edge.poorer].join(", ")}]` }, { name: "built edges", value: builtEdgeKeys.size }],
    });
  }

  pushStep({
    title: { vi: "Khởi tạo answer = -1", en: "Initialize answer with -1" },
    note: {
      vi: "answer[node] = -1 nghĩa là DFS(node) chưa được tính. Giá trị khác -1 sẽ đóng vai trò memo.",
      en: "answer[node] = -1 means DFS(node) has not been computed. Any other value acts as memoization.",
    },
    codeLines: [7],
    event: "init-answer",
    phase: "build",
    vars: [{ name: "answer", value: answerText() }],
  });

  function dfs(node, parentStack = [], fromNode = null) {
    const callStack = [...parentStack, node];
    pushStep({
      title: { vi: `Gọi dfs(${node})`, en: `Call dfs(${node})` },
      note: {
        vi: `Call stack thêm người ${node}. Mục tiêu: tìm người ít ồn nhất trong tập {${node}} và mọi người giàu hơn ${node}.`,
        en: `Push person ${node} onto the call stack. Goal: find the quietest among {${node}} and everyone richer than ${node}.`,
      },
      codeLines: [9],
      event: "call",
      phase: "dfs",
      callStack,
      currentNode: node,
      activeEdge: fromNode === null ? null : [fromNode, node],
      vars: [{ name: "node", value: node }, { name: "call stack", value: `[${callStack.join(", ")}]` }],
    });

    const memoized = answer[node] !== -1;
    pushStep({
      title: memoized
        ? { vi: `answer[${node}] = ${answer[node]} → memo hit`, en: `answer[${node}] = ${answer[node]} → memo hit` }
        : { vi: `answer[${node}] == -1 → cần tính`, en: `answer[${node}] == -1 → compute it` },
      note: memoized
        ? { vi: `Kết quả dfs(${node}) đã có: người ${answer[node]} với quiet=${quiet[answer[node]]}. Không DFS lại.`, en: `dfs(${node}) is cached: person ${answer[node]} with quiet=${quiet[answer[node]]}. Do not recompute it.` }
        : { vi: "Chưa có memo, tiếp tục khởi tạo ứng viên là chính node.", en: "No memo yet; initialize the candidate with the node itself." },
      codeLines: [10],
      event: memoized ? "memo-hit" : "memo-miss",
      phase: memoized ? "memo" : "dfs",
      callStack,
      currentNode: node,
      activeEdge: fromNode === null ? null : [fromNode, node],
      currentBestPerson: memoized ? answer[node] : null,
      vars: [{ name: `answer[${node}]`, value: answer[node] }, { name: "memoized?", value: memoized }],
    });

    if (memoized) {
      pushStep({
        title: { vi: `Return memo của dfs(${node})`, en: `Return cached dfs(${node})` },
        note: { vi: `Quay về caller với answer[${node}] = ${answer[node]}.`, en: `Return to the caller with answer[${node}] = ${answer[node]}.` },
        codeLines: [11],
        event: "memo-return",
        phase: "memo",
        callStack,
        currentNode: node,
        activeEdge: fromNode === null ? null : [fromNode, node],
        currentBestPerson: answer[node],
        vars: [{ name: "cached person", value: answer[node] }, { name: "cached quiet", value: quiet[answer[node]] }],
      });
      return answer[node];
    }

    answer[node] = node;
    pushStep({
      title: { vi: `answer[${node}] = ${node}: chọn chính mình trước`, en: `answer[${node}] = ${node}: start with itself` },
      note: {
        vi: `Ứng viên hiện tại là người ${node}, quiet=${quiet[node]}. Các người giàu hơn có thể thay thế ứng viên này.`,
        en: `The current candidate is person ${node}, quiet=${quiet[node]}. Richer people may replace this candidate.`,
      },
      codeLines: [12],
      event: "seed",
      phase: "dfs",
      callStack,
      currentNode: node,
      currentBestPerson: node,
      vars: [{ name: `answer[${node}]`, value: node }, { name: `quiet[${node}]`, value: quiet[node] }, { name: "answer", value: answerText() }],
    });

    for (const neighbor of graph[node]) {
      pushStep({
        title: { vi: `Xét richer neighbor ${neighbor} của ${node}`, en: `Explore richer neighbor ${neighbor} of ${node}` },
        note: {
          vi: `Cạnh ${node} → ${neighbor} nghĩa là ${neighbor} giàu hơn ${node}. Trước tiên phải biết đáp án tốt nhất của ${neighbor}.`,
          en: `Edge ${node} → ${neighbor} means ${neighbor} is richer than ${node}. First obtain ${neighbor}'s best answer.`,
        },
        codeLines: [13],
        event: "choose-neighbor",
        phase: "explore",
        callStack,
        currentNode: node,
        neighbor,
        activeEdge: [node, neighbor],
        currentBestPerson: answer[node],
        vars: [{ name: "node", value: node }, { name: "neighbor", value: neighbor }, { name: `graph[${node}]`, value: `[${graph[node].join(", ")}]` }],
      });

      pushStep({
        title: { vi: `Đi sâu vào dfs(${neighbor})`, en: `Recurse into dfs(${neighbor})` },
        note: { vi: `Tạm dừng dfs(${node}); gọi dfs(${neighbor}) trước.`, en: `Pause dfs(${node}) and evaluate dfs(${neighbor}) first.` },
        codeLines: [14],
        event: "recurse",
        phase: "explore",
        callStack,
        currentNode: node,
        neighbor,
        activeEdge: [node, neighbor],
        currentBestPerson: answer[node],
        vars: [{ name: "caller", value: `dfs(${node})` }, { name: "callee", value: `dfs(${neighbor})` }],
      });
      dfs(neighbor, callStack, node);

      const currentBestPerson = answer[node];
      const candidatePerson = answer[neighbor];
      const willUpdate = quiet[candidatePerson] < quiet[currentBestPerson];
      pushStep({
        title: willUpdate
          ? { vi: `${quiet[candidatePerson]} < ${quiet[currentBestPerson]} → cập nhật`, en: `${quiet[candidatePerson]} < ${quiet[currentBestPerson]} → update` }
          : { vi: `${quiet[candidatePerson]} < ${quiet[currentBestPerson]}? False → giữ nguyên`, en: `${quiet[candidatePerson]} < ${quiet[currentBestPerson]}? False → keep current` },
        note: {
          vi: `So sánh quiet[answer[${neighbor}]] = quiet[${candidatePerson}] = ${quiet[candidatePerson]} với quiet[answer[${node}]] = quiet[${currentBestPerson}] = ${quiet[currentBestPerson]}.`,
          en: `Compare quiet[answer[${neighbor}]] = quiet[${candidatePerson}] = ${quiet[candidatePerson]} with quiet[answer[${node}]] = quiet[${currentBestPerson}] = ${quiet[currentBestPerson]}.`,
        },
        codeLines: [15],
        event: "compare",
        phase: "compare",
        callStack,
        currentNode: node,
        neighbor,
        activeEdge: [node, neighbor],
        currentBestPerson,
        candidatePerson,
        willUpdate,
        vars: [{ name: "current best", value: `${currentBestPerson} (quiet=${quiet[currentBestPerson]})` }, { name: "candidate", value: `${candidatePerson} (quiet=${quiet[candidatePerson]})` }, { name: "update?", value: willUpdate }],
      });

      if (willUpdate) {
        answer[node] = candidatePerson;
        pushStep({
          title: { vi: `answer[${node}] = ${candidatePerson}`, en: `answer[${node}] = ${candidatePerson}` },
          note: {
            vi: `Người ${candidatePerson} giàu hơn hoặc bằng ${node} và quiet=${quiet[candidatePerson]} nhỏ hơn ứng viên cũ.`,
            en: `Person ${candidatePerson} is richer than or equal to ${node} and quiet=${quiet[candidatePerson]} beats the previous candidate.`,
          },
          codeLines: [16],
          event: "update",
          phase: "compare",
          callStack,
          currentNode: node,
          neighbor,
          activeEdge: [node, neighbor],
          currentBestPerson,
          candidatePerson,
          willUpdate: true,
          changedPerson: node,
          vars: [{ name: `answer[${node}]`, value: candidatePerson }, { name: "answer", value: answerText() }],
        });
      }
    }

    doneNodes.add(node);
    pushStep({
      title: { vi: `Hoàn tất dfs(${node}) → người ${answer[node]}`, en: `Finish dfs(${node}) → person ${answer[node]}` },
      note: {
        vi: `Memo answer[${node}] = ${answer[node]} (quiet=${quiet[answer[node]]}) đã hoàn tất và có thể tái sử dụng.`,
        en: `Memo answer[${node}] = ${answer[node]} (quiet=${quiet[answer[node]]}) is complete and reusable.`,
      },
      codeLines: [13],
      event: "finish-node",
      phase: "memo",
      callStack,
      currentNode: node,
      currentBestPerson: answer[node],
      vars: [{ name: `answer[${node}]`, value: answer[node] }, { name: "quiet winner", value: quiet[answer[node]] }, { name: "memoized nodes", value: `[${[...doneNodes].join(", ")}]` }],
    });
    return answer[node];
  }

  for (let index = 0; index < n; index++) {
    pushStep({
      title: { vi: `Vòng ngoài i = ${index}`, en: `Outer loop i = ${index}` },
      note: answer[index] === -1
        ? { vi: `Chưa có answer[${index}], bắt đầu DFS mới.`, en: `answer[${index}] is unknown, so start a new DFS.` }
        : { vi: `answer[${index}] đã có memo; dfs(${index}) sẽ trả ngay.`, en: `answer[${index}] is memoized; dfs(${index}) will return immediately.` },
      codeLines: [18],
      event: "outer-loop",
      phase: "dfs",
      outerIndex: index,
      currentNode: index,
      currentBestPerson: answer[index] === -1 ? null : answer[index],
      vars: [{ name: "i", value: index }, { name: `answer[${index}]`, value: answer[index] }],
    });
    pushStep({
      title: { vi: `Thực thi dfs(${index})`, en: `Execute dfs(${index})` },
      note: { vi: "Memoization bảo đảm mỗi node chỉ được tính đầy đủ một lần.", en: "Memoization ensures each node is fully computed only once." },
      codeLines: [19],
      event: "outer-call",
      phase: "dfs",
      outerIndex: index,
      currentNode: index,
      currentBestPerson: answer[index] === -1 ? null : answer[index],
      vars: [{ name: "i", value: index }],
    });
    dfs(index);
  }

  pushStep({
    title: { vi: `Return answer = ${answerText()}`, en: `Return answer = ${answerText()}` },
    note: {
      vi: "Mỗi answer[i] là người có quiet nhỏ nhất trong chính i và toàn bộ người giàu hơn i theo quan hệ bắc cầu.",
      en: "Each answer[i] is the quietest person among i and everyone transitively richer than i.",
    },
    codeLines: [20],
    event: "done",
    phase: "done",
    final: true,
    vars: [{ name: "answer", value: answerText() }],
  });

  return { richer: richerRaw, quiet, answer: answerText(), steps };
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
 * LeetCode 1926: Nearest Exit from Entrance in Maze.
 * BFS from the entrance. Each level represents the number of steps taken.
 * Exit = any open cell on the border except the entrance itself.
 */
function buildSteps1926(input, params) {
  const rawRows = String(input)
    .split("|")
    .map((row) => row.trim())
    .filter((row) => row.length > 0);

  const maze = rawRows.map((row) =>
    row.includes(",") ? row.split(",").map((c) => c.trim()) : row.split("")
  );
  const entranceRow = Number(params.entranceRow ?? 0);
  const entranceCol = Number(params.entranceCol ?? 0);
  const rows = maze.length;
  const cols = rows > 0 ? maze[0].length : 0;
  const steps = [];
  const invalidMaze =
    rows === 0 ||
    cols === 0 ||
    maze.some((row) => row.length !== cols || row.some((cell) => cell !== "." && cell !== "+")) ||
    entranceRow < 0 ||
    entranceRow >= rows ||
    entranceCol < 0 ||
    entranceCol >= cols ||
    maze[entranceRow][entranceCol] !== ".";

  if (invalidMaze) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3, 4, 5],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Maze phải gồm '.' và '+', các hàng cùng độ dài, entrance nằm trong maze và là ô '.'. Ví dụ: +.+|...|+.. với entranceRow=1, entranceCol=0.",
        en: "Maze must contain '.' and '+', all rows must have the same length, and entrance must be an open '.' cell. Example: +.+|...|+.. with entranceRow=1, entranceCol=0.",
      },
    });
    return { maze, entrance: [entranceRow, entranceCol], answer: -1, steps };
  }

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const dist = Array.from({ length: rows }, () => Array(cols).fill("."));
  const q = [[entranceRow, entranceCol, 0]];
  let head = 0;
  visited[entranceRow][entranceCol] = true;
  dist[entranceRow][entranceCol] = 0;

  const isOpen = (r, c) => maze[r] && maze[r][c] === ".";
  const isBorder = (r, c) => r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  steps.push({
    title: { vi: "Khởi tạo BFS", en: "Initialize BFS" },
    grid: {
      maze: maze.map((row) => [...row]),
      dist: dist.map((row) => [...row]),
      hlCell: [entranceRow, entranceCol],
      pathCells: [],
    },
    highlight: [entranceRow * cols + entranceCol],
    mark: [entranceRow * cols + entranceCol],
    codeLines: [3, 4, 5],
    vars: [
      { name: "entrance", value: `(${entranceRow}, ${entranceCol})` },
      { name: "queue", value: `[(${entranceRow},${entranceCol},0)]` },
    ],
    note: {
      vi: `Bắt đầu BFS tại (${entranceRow}, ${entranceCol}). Một ô được coi là lối thoát nếu nó ở biên và không phải entrance.`,
      en: `Start BFS at (${entranceRow}, ${entranceCol}). A cell is an exit if it is on the border and is not the entrance.`,
    },
  });

  const prev = new Map();
  let answer = -1;
  let exitCell = null;

  while (head < q.length) {
    const [r, c, d] = q[head++];

    if ((r !== entranceRow || c !== entranceCol) && isBorder(r, c)) {
      answer = d;
      exitCell = [r, c];
      break;
    }

    const expanded = [];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (visited[nr][nc] || !isOpen(nr, nc)) continue;
      visited[nr][nc] = true;
      dist[nr][nc] = d + 1;
      q.push([nr, nc, d + 1]);
      prev.set(`${nr},${nc}`, [r, c]);
      expanded.push([nr, nc]);
    }

    steps.push({
      title: { vi: `BFS bước ${d}`, en: `BFS step ${d}` },
      grid: {
        maze: maze.map((row) => [...row]),
        dist: dist.map((row) => [...row]),
        hlCell: [r, c],
        pathCells: expanded,
      },
      highlight: expanded.map(([rr, cc]) => rr * cols + cc),
      mark: [r * cols + c],
      codeLines: [7, 8, 9, 10, 11, 12],
      vars: [
        { name: "current", value: `(${r}, ${c})` },
        { name: "distance", value: d },
        { name: "new cells", value: expanded.length ? expanded.map((p) => `(${p[0]},${p[1]})`).join(", ") : "none" },
      ],
      note: {
        vi: expanded.length
          ? `Từ (${r}, ${c}) mở rộng tới: ${expanded.map((p) => `(${p[0]}, ${p[1]})`).join(", ")}. BFS đảm bảo level sau là số bước +1.`
          : `Từ (${r}, ${c}) không mở rộng thêm được ô nào hợp lệ.`,
        en: expanded.length
          ? `From (${r}, ${c}) expanded to: ${expanded.map((p) => `(${p[0]}, ${p[1]})`).join(", ")}. BFS ensures the next level is one more step.`
          : `From (${r}, ${c}) there were no valid cells to expand to.`,
      },
    });
  }

  if (answer >= 0) {
    const pathCells = [];
    let cur = exitCell;
    while (cur) {
      pathCells.push(cur);
      const key = `${cur[0]},${cur[1]}`;
      cur = prev.get(key) || null;
    }
    pathCells.reverse();

    steps.push({
      title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
      grid: {
        maze: maze.map((row) => [...row]),
        dist: dist.map((row) => [...row]),
        hlCell: exitCell,
        pathCells,
      },
      highlight: exitCell ? [exitCell[0] * cols + exitCell[1]] : [],
      mark: exitCell ? [exitCell[0] * cols + exitCell[1]] : [],
      final: true,
      codeLines: [13],
      vars: [
        { name: "answer", value: answer },
        { name: "exit", value: exitCell ? `(${exitCell[0]}, ${exitCell[1]})` : "none" },
      ],
      note: {
        vi: `Lối thoát gần nhất cách entrance ${answer} bước. BFS tìm ra đường ngắn nhất theo từng level.`,
        en: `The nearest exit is ${answer} steps away. BFS finds the shortest path level by level.`,
      },
    });
  } else {
    steps.push({
      title: { vi: "Không có lối thoát", en: "No exit found" },
      grid: {
        maze: maze.map((row) => [...row]),
        dist: dist.map((row) => [...row]),
        hlCell: [entranceRow, entranceCol],
        pathCells: [],
      },
      highlight: [],
      mark: [entranceRow * cols + entranceCol],
      final: true,
      codeLines: [13],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "BFS đã duyệt hết các ô có thể đi tới nhưng không gặp lối thoát hợp lệ.",
        en: "BFS explored all reachable cells but never found a valid exit.",
      },
    });
  }

  return { maze, entrance: [entranceRow, entranceCol], answer, steps };
}

/**
 * Generate steps for LeetCode 847 Approach 2: DP Bitmask + Floyd-Warshall.
 * Phase 1: Floyd-Warshall → dist[i][j] = shortest path between any pair.
 * Phase 2: TSP DP — dp[mask][i] = min cost to visit nodes in mask, ending at i.
 */
function buildSteps847DP(input) {
  const adj = String(input)
    .split("|")
    .map((row) => row.trim())
    .map((row) => (row.length === 0 ? [] : row.split(",").map(Number).filter((v) => !isNaN(v))));
  const n = adj.length;
  const steps = [];
  const fullMask = (1 << n) - 1;
  const INF = Infinity;

  // Build edge list for graph display
  const edgeList = [];
  const seenE = new Set();
  for (let u = 0; u < n; u++) {
    for (const v of adj[u]) {
      const k = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (!seenE.has(k)) { seenE.add(k); edgeList.push({ u, v, w: "" }); }
    }
  }
  const nodes = Array.from({ length: n }, (_, i) => i);

  const maskBin = (m) => m.toString(2).padStart(n, "0");
  const maskNodes = (m) => {
    const a = [];
    for (let i = 0; i < n; i++) if (m & (1 << i)) a.push(i);
    return a;
  };

  function makeGraph(hlNodes, visitedNodes) {
    return {
      nodes: nodes.map((id) => ({ id })),
      edges: edgeList,
      hlNodes: hlNodes || [],
      hlEdges: [],
      visitedNodes: visitedNodes || [],
    };
  }

  // Intro
  steps.push({
    title: { vi: "Approach 2: DP Bitmask + Floyd-Warshall", en: "Approach 2: DP Bitmask + Floyd-Warshall" },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    codeBlock: 2,
    codeLines: [3, 4, 5, 6],
    vars: [
      { name: "n", value: n },
      { name: "fullMask", value: maskBin(fullMask) },
      { name: "phases", value: "1) Floyd-Warshall  2) TSP DP" },
    ],
    note: {
      vi:
        `Bài này có thể giải bằng DP TSP-like, nhưng cần Floyd-Warshall trước.\n` +
        `Phase 1: tính dist[i][j] = đường ngắn nhất giữa mọi cặp i,j (FW O(n³)).\n` +
        `Phase 2: dp[mask][i] = chi phí nhỏ nhất thăm các nút trong mask, KẾT THÚC tại i.\n` +
        `Đáp án = min(dp[fullMask][i]) với mọi i.`,
      en:
        `This problem can be solved with TSP-like DP, but needs Floyd-Warshall first.\n` +
        `Phase 1: compute dist[i][j] = shortest path between every pair (FW O(n³)).\n` +
        `Phase 2: dp[mask][i] = min cost to visit nodes in mask, ENDING at i.\n` +
        `Answer = min(dp[fullMask][i]) over all i.`,
    },
  });

  // Phase 1: Floyd-Warshall
  const dist = Array.from({ length: n }, () => new Array(n).fill(INF));
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
    for (const j of adj[i]) dist[i][j] = 1;
  }
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  // Show distance matrix
  const distMatrix = dist.map((row) => row.map((v) => (v === INF ? "∞" : String(v))));
  steps.push({
    title: { vi: "Phase 1: Floyd-Warshall xong", en: "Phase 1: Floyd-Warshall done" },
    arr: [],
    grid: {
      dp: distMatrix,
      text1: Array.from({ length: n }, (_, i) => String(i)),
      text2: Array.from({ length: n }, (_, i) => String(i)),
      hlCell: null,
      pathCells: [],
    },
    highlight: [],
    mark: [],
    codeBlock: 2,
    codeLines: [7, 8, 9, 10, 11, 12, 13, 14, 15],
    vars: [
      { name: "dist matrix", value: `${n}×${n}` },
      { name: "max distance", value: Math.max(...dist.flat().filter((v) => v !== INF)) },
    ],
    note: {
      vi:
        `Floyd-Warshall đã chạy xong. Ma trận dist[i][j] = đường ngắn nhất từ i đến j.\n` +
        `Lưới hiện tại: hàng = i, cột = j, giá trị = dist[i][j].\n` +
        `Nhờ dist[][], DP TSP có thể nhảy thẳng giữa 2 nút bất kỳ (không cần qua trung gian).`,
      en:
        `Floyd-Warshall done. dist[i][j] = shortest path from i to j.\n` +
        `Grid: row = i, col = j, value = dist[i][j].\n` +
        `With dist[][], TSP DP can jump directly between any pair (no need for intermediate nodes).`,
    },
  });

  // Phase 2: TSP DP
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
  for (let i = 0; i < n; i++) dp[1 << i][i] = 0;

  // Group masks by popcount and show snapshots
  const popcount = (m) => {
    let c = 0;
    while (m) { c += m & 1; m >>>= 1; }
    return c;
  };

  // Process masks in order
  for (let mask = 0; mask < 1 << n; mask++) {
    for (let i = 0; i < n; i++) {
      if (dp[mask][i] === INF) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        const newMask = mask | (1 << j);
        const cost = dp[mask][i] + dist[i][j];
        if (cost < dp[newMask][j]) dp[newMask][j] = cost;
      }
    }
  }

  // Show one snapshot per popcount level (after all masks of that size processed)
  for (let pc = 1; pc <= n; pc++) {
    // Find masks with this popcount
    const masksOfPc = [];
    for (let m = 0; m < 1 << n; m++) if (popcount(m) === pc) masksOfPc.push(m);

    // Pick best example: the mask with smallest min dp value at popcount pc
    let bestMask = masksOfPc[0];
    let bestEnd = 0;
    let bestVal = INF;
    for (const m of masksOfPc) {
      for (let i = 0; i < n; i++) {
        if (dp[m][i] < bestVal) {
          bestVal = dp[m][i];
          bestMask = m;
          bestEnd = i;
        }
      }
    }

    if (bestVal === INF) continue;
    const visitedNodes = maskNodes(bestMask);

    steps.push({
      title: { vi: `DP: popcount=${pc} (đã thăm ${pc}/${n} nút)`, en: `DP: popcount=${pc} (visited ${pc}/${n} nodes)` },
      arr: [],
      graph: makeGraph([bestEnd], visitedNodes),
      highlight: [],
      mark: [],
      codeBlock: 2,
      codeLines: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
      vars: [
        { name: "popcount", value: pc },
        { name: "example mask", value: maskBin(bestMask) },
        { name: "visited", value: `[${visitedNodes.join(", ")}]` },
        { name: "end node", value: bestEnd },
        { name: "dp[mask][end]", value: bestVal },
      ],
      note: {
        vi:
          `Sau khi xử lý mọi mask có popcount = ${pc}.\n` +
          `Ví dụ: mask = ${maskBin(bestMask)} (thăm [${visitedNodes.join(", ")}]), kết thúc tại nút ${bestEnd}, dp = ${bestVal}.\n` +
          `Transition: dp[mask | (1<<j)][j] = min(dp[mask][i] + dist[i][j]).`,
        en:
          `After processing all masks with popcount = ${pc}.\n` +
          `Example: mask = ${maskBin(bestMask)} (visited [${visitedNodes.join(", ")}]), ending at node ${bestEnd}, dp = ${bestVal}.\n` +
          `Transition: dp[mask | (1<<j)][j] = min(dp[mask][i] + dist[i][j]).`,
      },
    });
  }

  // Final answer
  let answer = INF;
  let bestEnd = 0;
  for (let i = 0; i < n; i++) {
    if (dp[fullMask][i] < answer) { answer = dp[fullMask][i]; bestEnd = i; }
  }

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [],
    graph: makeGraph([bestEnd], nodes),
    highlight: [],
    mark: [],
    final: true,
    codeBlock: 2,
    codeLines: [28],
    vars: [
      { name: "fullMask", value: maskBin(fullMask) },
      { name: "best end node", value: bestEnd },
      { name: "answer", value: answer },
      { name: "dp[fullMask] row", value: dp[fullMask].map((v) => (v === INF ? "∞" : v)).join(", ") },
    ],
    note: {
      vi:
        `Đáp án = min(dp[fullMask][i]) với mọi i = ${answer}.\n` +
        `Nút kết thúc tốt nhất: ${bestEnd}.\n` +
        `Các giá trị dp[fullMask][i]: [${dp[fullMask].map((v) => (v === INF ? "∞" : v)).join(", ")}].`,
      en:
        `Answer = min(dp[fullMask][i]) over all i = ${answer}.\n` +
        `Best ending node: ${bestEnd}.\n` +
        `dp[fullMask][i] values: [${dp[fullMask].map((v) => (v === INF ? "∞" : v)).join(", ")}].`,
    },
  });

  return { adj: input, answer, steps };
}

/**
 * Generate steps for LeetCode 847: Shortest Path Visiting All Nodes.
 * BFS with state = (node, visited_mask). Each level = 1 step.
 * Starts from EVERY node simultaneously (any starting point allowed).
 */
function buildSteps847(input, params) {
  const approach = (params && params.approach) || 1;
  if (approach === 2) return buildSteps847DP(input);

  // Parse adjacency: "1,2,3|0|0|0" → [[1,2,3],[0],[0],[0]]
  const adj = String(input)
    .split("|")
    .map((row) => row.trim())
    .map((row) => (row.length === 0 ? [] : row.split(",").map(Number).filter((v) => !isNaN(v))));
  const n = adj.length;
  const steps = [];
  const fullMask = (1 << n) - 1;

  // Build edge list for graph display
  const edgeList = [];
  const seenEdges = new Set();
  for (let u = 0; u < n; u++) {
    for (const v of adj[u]) {
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        edgeList.push({ u, v, w: "" });
      }
    }
  }

  const nodes = Array.from({ length: n }, (_, i) => i);

  // Helper: format mask as binary string + visited nodes
  const maskBinary = (m) => m.toString(2).padStart(n, "0");
  const visitedSet = (m) => {
    const arr = [];
    for (let i = 0; i < n; i++) if (m & (1 << i)) arr.push(i);
    return arr;
  };

  function makeGraph(hlNodes, visitedNodes) {
    return {
      nodes: nodes.map((id) => ({ id })),
      edges: edgeList,
      hlNodes: hlNodes || [],
      hlEdges: [],
      visitedNodes: visitedNodes || [],
    };
  }

  steps.push({
    title: { vi: "Khởi tạo BFS", en: "Initialize BFS" },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6],
    vars: [
      { name: "n", value: n },
      { name: "fullMask (target)", value: maskBinary(fullMask) + " = " + fullMask },
      { name: "starting states", value: n },
    ],
    note: {
      vi:
        `${n} nút. Mục tiêu: đường ngắn nhất thăm TẤT CẢ nút (có thể bắt đầu/kết thúc ở bất kỳ nút nào, được thăm lại).\n` +
        `BFS với state = (node, visited_mask). fullMask = ${maskBinary(fullMask)} (tất cả ${n} bit = 1).\n` +
        `Bắt đầu BFS đồng thời từ MỌI nút: thêm (i, 1<<i, 0) vào queue cho i = 0..${n - 1}.`,
      en:
        `${n} nodes. Goal: shortest path visiting ALL nodes (can start/end anywhere, may revisit).\n` +
        `BFS with state = (node, visited_mask). fullMask = ${maskBinary(fullMask)} (all ${n} bits set).\n` +
        `Start BFS simultaneously from EVERY node: enqueue (i, 1<<i, 0) for i = 0..${n - 1}.`,
    },
  });

  if (n === 1) {
    steps.push({
      title: { vi: "n=1 → answer = 0", en: "n=1 → answer = 0" },
      arr: [],
      graph: makeGraph([0], [0]),
      highlight: [],
      mark: [],
      final: true,
      codeLines: [4],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Chỉ có 1 nút, đường đi rỗng.", en: "Only 1 node, empty path." },
    });
    return { adj: input, answer: 0, steps };
  }

  // BFS
  const visited = new Set();
  let frontier = [];
  for (let i = 0; i < n; i++) {
    const mask = 1 << i;
    frontier.push([i, mask]);
    visited.add(`${i},${mask}`);
  }

  let answer = -1;
  let dist = 0;
  const MAX_STEPS_SHOW = 12;
  let stepShown = 1;

  // Check if any starting state already covers all (only if n==1)
  for (const [node, mask] of frontier) {
    if (mask === fullMask) { answer = 0; break; }
  }

  while (frontier.length > 0 && answer === -1) {
    dist++;
    const nextFrontier = [];

    for (const [node, mask] of frontier) {
      for (const next of adj[node]) {
        const newMask = mask | (1 << next);
        const key = `${next},${newMask}`;
        if (visited.has(key)) continue;
        if (newMask === fullMask) {
          answer = dist;
          frontier = []; // break outer loop
          break;
        }
        visited.add(key);
        nextFrontier.push([next, newMask]);
      }
      if (answer !== -1) break;
    }

    // Show a sample step
    if (stepShown < MAX_STEPS_SHOW) {
      stepShown++;
      // Pick sample state for display
      const sample = nextFrontier[0] || (answer !== -1 ? [n - 1, fullMask] : null);
      const sampleNode = sample ? sample[0] : 0;
      const sampleMask = sample ? sample[1] : 0;
      const visitedArr = visitedSet(sampleMask);

      steps.push({
        title: { vi: `Bước ${dist}: ${answer !== -1 ? "tới đích" : nextFrontier.length + " state mới"}`, en: `Step ${dist}: ${answer !== -1 ? "reached target" : nextFrontier.length + " new states"}` },
        arr: [],
        graph: makeGraph([sampleNode], visitedArr),
        highlight: [],
        mark: [],
        codeLines: [9, 10, 11, 12, 13, 14, 15, 16],
        vars: [
          { name: "dist", value: dist },
          { name: "frontier processed", value: frontier.length },
          { name: "new states", value: nextFrontier.length },
          { name: "sample state", value: `node=${sampleNode}, mask=${maskBinary(sampleMask)}` },
          { name: "sample visited", value: `[${visitedArr.join(", ")}]` },
          { name: "total visited", value: visited.size },
        ],
        note: {
          vi:
            `Bước ${dist}: từ ${frontier.length} state, sinh ${nextFrontier.length} state mới.\n` +
            `Ví dụ: ở nút ${sampleNode} đã thăm [${visitedArr.join(", ")}] (mask=${maskBinary(sampleMask)}).\n` +
            (answer !== -1 ? `✓ Có state đạt fullMask sau ${dist} bước → answer = ${dist}.` : "Tiếp tục BFS."),
          en:
            `Step ${dist}: from ${frontier.length} states, generated ${nextFrontier.length} new.\n` +
            `Sample: at node ${sampleNode} having visited [${visitedArr.join(", ")}] (mask=${maskBinary(sampleMask)}).\n` +
            (answer !== -1 ? `✓ A state reached fullMask after ${dist} steps → answer = ${dist}.` : "Continue BFS."),
        },
      });
    }

    if (answer !== -1) break;
    frontier = nextFrontier;
  }

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [],
    graph: makeGraph([], nodes),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [17],
    vars: [
      { name: "answer", value: answer },
      { name: "states explored", value: visited.size },
    ],
    note: {
      vi:
        `Đường đi ngắn nhất thăm tất cả ${n} nút có độ dài ${answer}.\n` +
        `Tổng số state (node, mask) đã khám phá: ${visited.size}.`,
      en:
        `Shortest path visiting all ${n} nodes has length ${answer}.\n` +
        `Total (node, mask) states explored: ${visited.size}.`,
    },
  });

  return { adj: input, answer, steps };
}

/**
 * Generate steps for LeetCode 207: Course Schedule.
 * Topological sort (Kahn's algorithm) — detects cycle.
 * prerequisites[i] = [a, b] means to take a you must first take b (b → a).
 * Returns true if all courses can be finished.
 */
function buildSteps207(input, params) {
  const numCourses = params.numCourses || 2;
  const edgesRaw = String(input).split(",").map((e) => e.trim()).filter((e) => e.length > 0);
  // Each "a-b" means [a, b] in LeetCode → b is prereq of a (b → a)
  const pairs = edgesRaw.map((e) => {
    const parts = e.split("-").map(Number);
    return [parts[0], parts[1]]; // [course, prereq]
  });
  const steps = [];

  const adj = {};
  const inDeg = {};
  const courses = Array.from({ length: numCourses }, (_, i) => i);
  for (const c of courses) { adj[c] = []; inDeg[c] = 0; }
  for (const [a, b] of pairs) {
    // b → a (must take b before a)
    adj[b].push(a);
    inDeg[a] = (inDeg[a] || 0) + 1;
  }

  const taken = new Set();

  function makeGraph(hlNodes, hlEdges) {
    return {
      nodes: courses.map((id) => ({ id, dist: inDeg[id] })),
      edges: pairs.map(([a, b]) => ({ u: b, v: a, w: "" })),
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
      { name: "numCourses", value: numCourses },
      { name: "prerequisites", value: pairs.map(([a, b]) => `[${a},${b}]`).join(", ") || "none" },
      { name: "in-degree", value: courses.map((c) => `${c}:${inDeg[c]}`).join(", ") },
    ],
    note: {
      vi:
        `Có ${numCourses} môn (0..${numCourses - 1}), ${pairs.length} điều kiện tiên quyết.\n` +
        `Mỗi cặp [a, b] nghĩa là phải học b trước a → cạnh b → a.\n` +
        `Số bên dưới nút = in-degree (số môn phải học trước nó).\n` +
        `Mục tiêu: kiểm tra có thể học hết không (đồ thị không có chu trình)?`,
      en:
        `${numCourses} courses (0..${numCourses - 1}), ${pairs.length} prerequisites.\n` +
        `Each [a, b] means take b before a → edge b → a.\n` +
        `Number below node = in-degree (number of prerequisites).\n` +
        `Goal: can all be finished (no cycle)?`,
    },
  });

  let answer = true;

  while (taken.size < numCourses) {
    const available = courses.filter((c) => !taken.has(c) && inDeg[c] === 0);

    if (available.length === 0) {
      // Cycle
      answer = false;
      steps.push({
        title: { vi: "Bế tắc → có chu trình → false", en: "Stuck → cycle detected → false" },
        arr: [],
        graph: makeGraph(courses.filter((c) => !taken.has(c)), []),
        highlight: [],
        mark: [],
        final: true,
        codeLines: [15, 16],
        vars: [
          { name: "taken", value: `${taken.size}/${numCourses}` },
          { name: "remaining", value: courses.filter((c) => !taken.has(c)).map((c) => `${c}:${inDeg[c]}`).join(", ") },
          { name: "answer", value: false },
        ],
        note: {
          vi:
            `Không còn môn nào có in-degree = 0, nhưng vẫn còn ${numCourses - taken.size} môn chưa học.\n` +
            `→ Đồ thị có chu trình → KHÔNG thể hoàn thành → return false.`,
          en:
            `No course has in-degree = 0, but ${numCourses - taken.size} courses remain.\n` +
            `→ Cycle exists → CANNOT finish → return false.`,
        },
      });
      return { numCourses, edges: edgesRaw, answer: false, steps };
    }

    // Take all available this round
    for (const c of available) taken.add(c);
    const hlEdges = [];
    for (const c of available) {
      for (const next of adj[c]) {
        inDeg[next]--;
        hlEdges.push([c, next]);
      }
    }

    steps.push({
      title: { vi: `Lấy ${available.length} môn có in-deg = 0`, en: `Pop ${available.length} courses with in-deg = 0` },
      arr: [],
      graph: makeGraph(available, hlEdges),
      highlight: [],
      mark: [],
      codeLines: [9, 10, 11, 12, 13, 14],
      vars: [
        { name: "available", value: `[${available.join(", ")}]` },
        { name: "edges decremented", value: hlEdges.length },
        { name: "in-degree after", value: courses.filter((c) => !taken.has(c)).map((c) => `${c}:${inDeg[c]}`).join(", ") || "(all done)" },
        { name: "taken", value: `${taken.size}/${numCourses}` },
      ],
      note: {
        vi:
          `Lấy mọi môn có in-degree = 0: [${available.join(", ")}].\n` +
          `Giảm in-degree các môn phụ thuộc (${hlEdges.length} cạnh).\n` +
          `Đã học ${taken.size}/${numCourses} môn.`,
        en:
          `Pop all courses with in-degree = 0: [${available.join(", ")}].\n` +
          `Decrement in-degree of dependents (${hlEdges.length} edges).\n` +
          `Taken: ${taken.size}/${numCourses}.`,
      },
    });
  }

  steps.push({
    title: { vi: "✓ Hoàn thành tất cả → true", en: "✓ All done → true" },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [17],
    vars: [
      { name: "taken", value: `${numCourses}/${numCourses}` },
      { name: "answer", value: true },
    ],
    note: {
      vi: `Đã học hết ${numCourses} môn → đồ thị không có chu trình → return true.`,
      en: `All ${numCourses} courses taken → no cycle → return true.`,
    },
  });

  return { numCourses, edges: edgesRaw, answer: true, steps };
}

/**
 * Layout helper for LeetCode 1136: places each course in the column of the
 * semester it WOULD be taken in (simulated once upfront via Kahn's algorithm),
 * so the visualization directly shows "these courses are grouped together"
 * instead of a circle with only in-degree numbers to infer that from.
 * Courses stuck in a cycle (never reach in-degree 0) get their own trailing
 * "stuck" column.
 */
function make1136FlowLayout(n, courses, adj, inDegInit) {
  const inDeg = { ...inDegInit };
  const levelOf = {};
  let level = 0;
  let remaining = courses.filter((c) => !(c in levelOf));
  while (remaining.length) {
    const available = remaining.filter((c) => inDeg[c] === 0);
    if (available.length === 0) break;
    for (const c of available) {
      levelOf[c] = level;
      for (const next of adj[c]) inDeg[next]--;
    }
    level++;
    remaining = remaining.filter((c) => !(c in levelOf));
  }
  const stuckLevel = level; // courses still unassigned (cycle) share the last column
  const groups = new Map();
  for (const c of courses) {
    const lv = c in levelOf ? levelOf[c] : stuckLevel;
    if (!groups.has(lv)) groups.set(lv, []);
    groups.get(lv).push(c);
  }
  const levelCount = Math.max(1, groups.size);
  const positions = {};
  const columnLabels = [];
  [...groups.entries()].sort(([a], [b]) => a - b).forEach(([lv, ids], column) => {
    const x = levelCount === 1 ? 0.5 : column / (levelCount - 1);
    ids.forEach((id, row) => {
      positions[id] = {
        x,
        y: ids.length === 1 ? 0.5 : 0.14 + (0.72 * row) / (ids.length - 1),
      };
    });
    const isStuck = lv === stuckLevel && remaining.length > 0 && lv >= level;
    columnLabels.push({
      x,
      divider: column > 0,
      label: isStuck ? "⛔" : `S${lv + 1}`,
    });
  });
  return {
    layout: "flow",
    positions,
    columnLabels,
    width: Math.max(560, levelCount * 150 + 260),
    height: Math.max(280, 90 * Math.max(...[...groups.values()].map((g) => g.length))),
    dimUnfocused: true,
    caption: {
      vi: "Mỗi cột = một học kỳ (môn ở cùng cột được học cùng lúc) • số dưới node = in-degree còn lại",
      en: "Each column = one semester (courses in the same column are taken together) • number below node = remaining in-degree",
    },
  };
}

/**
 * Generate steps for LeetCode 1136: Parallel Courses.
 * Topological sort (Kahn's algorithm / BFS):
 *  - Find all courses with in-degree 0 → take them this semester.
 *  - Decrement in-degree of their dependents.
 *  - Repeat until all courses taken (return semester count) or stuck (cycle → -1).
 */
function buildSteps1136Legacy(input, params) {
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

  const layout = make1136FlowLayout(n, courses, adj, inDeg);
  const taken = new Set();

  // Graph snapshot helper
  function makeGraph(hlNodes, hlEdges) {
    return {
      ...layout,
      nodes: courses.map((id) => ({ id, dist: inDeg[id] })),
      edges: edges.map(([u, v]) => ({ u, v, w: "" })),
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: [...taken],
    };
  }

  steps.push({
    title: { vi: "Xây dựng adjacency và in-degree", en: "Build adjacency and in-degree" },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    codeLines: [9],
    vars: [
      { name: "n", value: n },
      { name: "relations", value: edges.map(([u, v]) => `${u}→${v}`).join(", ") || "none" },
      { name: "in-degree", value: courses.map((c) => `${c}:${inDeg[c]}`).join(", ") },
    ],
    note: {
      vi:
        `Với mỗi (u, v) trong relations: thêm cạnh u→v vào adj, tăng in_deg[v] lên 1 (dòng 7-9).\n` +
        `Sau khi xét hết ${edges.length} cạnh, in-degree mỗi môn là số tiên quyết còn thiếu. Cột trong hình sẽ = học kỳ mà môn đó SẼ được học.`,
      en:
        `For each (u, v) in relations: add edge u→v to adj, increment in_deg[v] (lines 7-9).\n` +
        `After processing all ${edges.length} edges, each course's in-degree is its number of prerequisites. Columns in the diagram show the semester each course will be taken in.`,
    },
  });

  let queue = courses.filter((c) => inDeg[c] === 0);
  steps.push({
    title: { vi: `queue khởi tạo: ${queue.length} môn không tiên quyết`, en: `queue starts with ${queue.length} course(s) with no prerequisite` },
    arr: [],
    graph: makeGraph(queue, []),
    highlight: [],
    mark: [],
    codeLines: [10],
    vars: [{ name: "queue", value: `[${queue.join(", ")}]` }],
    note: {
      vi: `queue chứa mọi môn có in-degree = 0: [${queue.join(", ") || "—"}]. Đây là các môn sẽ học ở học kỳ 1 (cột S1).`,
      en: `queue holds every course with in-degree = 0: [${queue.join(", ") || "—"}]. These will be taken in semester 1 (column S1).`,
    },
  });

  let semesters = 0;
  steps.push({
    title: { vi: "taken = 0", en: "taken = 0" },
    arr: [],
    graph: makeGraph(queue, []),
    highlight: [],
    mark: [],
    codeLines: [11],
    vars: [{ name: "taken", value: 0 }],
    note: {
      vi: "taken đếm số môn đã học tính đến giờ.",
      en: "taken counts how many courses have been completed so far.",
    },
  });
  steps.push({
    title: { vi: "semesters = 0", en: "semesters = 0" },
    arr: [],
    graph: makeGraph(queue, []),
    highlight: [],
    mark: [],
    codeLines: [12],
    vars: [{ name: "semesters", value: 0 }],
    note: {
      vi: "semesters đếm số học kỳ đã trải qua.",
      en: "semesters counts how many semesters have elapsed.",
    },
  });

  while (true) {
    const notEmpty = queue.length > 0;
    steps.push({
      title: notEmpty
        ? { vi: `queue còn ${queue.length} môn`, en: `queue still has ${queue.length} course(s)` }
        : { vi: "queue rỗng → dừng lặp", en: "queue is empty → stop looping" },
      arr: [],
      graph: makeGraph(queue, []),
      highlight: [],
      mark: [],
      codeLines: [13],
      vars: [{ name: "queue", value: `[${queue.join(", ")}]` }, { name: "condition", value: notEmpty }],
      note: notEmpty
        ? { vi: "queue chưa rỗng, tiếp tục học kỳ mới.", en: "The queue is not empty, so a new semester starts." }
        : { vi: "Không còn môn nào trong queue, thoát while.", en: "No courses remain in the queue, exit the while loop." },
    });
    if (!notEmpty) break;

    semesters++;
    steps.push({
      title: { vi: `Học kỳ ${semesters} bắt đầu`, en: `Semester ${semesters} begins` },
      arr: [],
      graph: makeGraph(queue, []),
      highlight: [],
      mark: [],
      codeLines: [14],
      vars: [{ name: "semesters", value: semesters }],
      note: { vi: `Bắt đầu học kỳ ${semesters}.`, en: `Starting semester ${semesters}.` },
    });

    const batch = [...queue];
    steps.push({
      title: { vi: `size = ${batch.length} (số môn học kỳ này)`, en: `size = ${batch.length} (courses this semester)` },
      arr: [],
      graph: makeGraph(batch, []),
      highlight: [],
      mark: [],
      codeLines: [15],
      vars: [{ name: "size", value: batch.length }, { name: "batch", value: `[${batch.join(", ")}]` }],
      note: {
        vi: `size chốt lại đúng ${batch.length} môn hiện có trong queue — chính là mọi môn học kỳ ${semesters} (cột S${semesters}); môn mới được đưa vào queue giữa lúc xử lý sẽ KHÔNG tính vào batch này.`,
        en: `size locks in exactly the ${batch.length} courses currently queued — all of semester ${semesters}'s courses (column S${semesters}); courses newly queued mid-batch are excluded.`,
      },
    });

    queue = [];
    for (const u of batch) {
      steps.push({
        title: { vi: `Pop u = ${u}`, en: `Pop u = ${u}` },
        arr: [],
        graph: makeGraph([u], []),
        highlight: [],
        mark: [],
        codeLines: [17],
        vars: [{ name: "u", value: u }],
        note: { vi: `Lấy môn ${u} ra khỏi queue để học ở học kỳ ${semesters}.`, en: `Remove course ${u} from the queue to take it in semester ${semesters}.` },
      });

      taken.add(u);
      steps.push({
        title: { vi: `taken += 1 → ${taken.size}`, en: `taken += 1 → ${taken.size}` },
        arr: [],
        graph: makeGraph([u], []),
        highlight: [],
        mark: [],
        codeLines: [18],
        vars: [{ name: "taken", value: `${taken.size}/${n}` }],
        note: { vi: `Đã học môn ${u}. Tổng cộng đã học ${taken.size}/${n} môn.`, en: `Course ${u} is now taken. Total taken: ${taken.size}/${n}.` },
      });

      for (const v of adj[u]) {
        inDeg[v]--;
        steps.push({
          title: { vi: `in_deg[${v}] -= 1 → ${inDeg[v]}`, en: `in_deg[${v}] -= 1 → ${inDeg[v]}` },
          arr: [],
          graph: makeGraph([v], [[u, v]]),
          highlight: [],
          mark: [],
          codeLines: [20],
          vars: [{ name: `in_deg[${v}]`, value: inDeg[v] }],
          note: { vi: `Môn ${u} là tiên quyết của môn ${v}, nên in-degree của ${v} giảm 1 vì ${u} vừa học xong.`, en: `Course ${u} is a prerequisite of ${v}, so ${v}'s in-degree drops by one now that ${u} is done.` },
        });

        const ready = inDeg[v] === 0;
        steps.push({
          title: ready
            ? { vi: `in_deg[${v}] == 0 → sẵn sàng`, en: `in_deg[${v}] == 0 → ready` }
            : { vi: `in_deg[${v}] == 0? False (còn ${inDeg[v]})`, en: `in_deg[${v}] == 0? False (${inDeg[v]} left)` },
          arr: [],
          graph: makeGraph([v], []),
          highlight: [],
          mark: [],
          codeLines: [21],
          vars: [{ name: `in_deg[${v}]`, value: inDeg[v] }, { name: "condition", value: ready }],
          note: ready
            ? { vi: `Môn ${v} đã hết tiên quyết, có thể học ở học kỳ sau.`, en: `Course ${v} has no prerequisites left, so it can be taken next semester.` }
            : { vi: `Môn ${v} còn ${inDeg[v]} tiên quyết chưa xong, chưa thể học.`, en: `Course ${v} still has ${inDeg[v]} unmet prerequisite(s), not ready yet.` },
        });

        if (ready) {
          queue.push(v);
          steps.push({
            title: { vi: `queue.append(${v})`, en: `queue.append(${v})` },
            arr: [],
            graph: makeGraph(queue, []),
            highlight: [],
            mark: [],
            codeLines: [22],
            vars: [{ name: "queue", value: `[${queue.join(", ")}]` }],
            note: { vi: `Đưa môn ${v} vào queue — sẽ được học ở học kỳ ${semesters + 1} (cột S${semesters + 1}).`, en: `Push course ${v} into the queue — it will be taken in semester ${semesters + 1} (column S${semesters + 1}).` },
          });
        }
      }
    }
  }

  const answer = taken.size === n ? semesters : -1;
  steps.push({
    title: answer === -1
      ? { vi: `return -1 (chỉ học được ${taken.size}/${n})`, en: `return -1 (only ${taken.size}/${n} taken)` }
      : { vi: `return ${answer} (học hết ${n} môn)`, en: `return ${answer} (all ${n} courses taken)` },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [23],
    vars: [
      { name: "taken", value: `${taken.size}/${n}` },
      { name: "semesters", value: semesters },
      { name: "answer", value: answer },
    ],
    note: answer === -1
      ? { vi: `queue rỗng nhưng chỉ học được ${taken.size}/${n} môn → phần còn lại bị kẹt trong chu trình (cột ⛔) → trả -1.`, en: `The queue is empty but only ${taken.size}/${n} courses were taken → the rest are stuck in a cycle (column ⛔) → return -1.` }
      : { vi: `Học hết ${n} môn trong ${answer} học kỳ.`, en: `All ${n} courses completed in ${answer} semesters.` },
  });

  return { n, edges: edgesRaw, answer, steps };
}

function buildSteps1136(input, params = {}) {
  const parsedN = Number(params.n);
  const n = Number.isFinite(parsedN) && parsedN > 0 ? Math.floor(parsedN) : 3;
  const rawRelations = String(input || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const relations = rawRelations.map((entry, index) => {
    const [from, to] = entry.split("-").map((value) => Number(value.trim()));
    return { from, to, key: `${from}-${to}-${index}`, index };
  }).filter((edge) => (
    Number.isInteger(edge.from)
    && Number.isInteger(edge.to)
    && edge.from >= 1
    && edge.from <= n
    && edge.to >= 1
    && edge.to <= n
  ));
  const courses = Array.from({ length: n }, (_, index) => index + 1);
  const graph = Array.from({ length: n }, () => []);
  const indegree = Array(n).fill(0);
  const builtEdgeKeys = new Set();
  const processedEdgeKeys = new Set();
  const completed = new Set();
  const semesterHistory = [];
  const steps = [];

  function buildSemesterPlan() {
    const planAdjacency = Array.from({ length: n + 1 }, () => []);
    const planIndegree = Array(n + 1).fill(0);
    for (const edge of relations) {
      planAdjacency[edge.from].push(edge.to);
      planIndegree[edge.to]++;
    }
    let ready = courses.filter((course) => planIndegree[course] === 0);
    const assigned = new Set();
    const columns = [];
    let semesterNumber = 1;
    while (ready.length) {
      const batch = [...ready];
      columns.push({ kind: "semester", semester: semesterNumber, courses: batch });
      const next = [];
      for (const course of batch) {
        assigned.add(course);
        for (const dependent of planAdjacency[course]) {
          planIndegree[dependent]--;
          if (planIndegree[dependent] === 0) next.push(dependent);
        }
      }
      ready = next;
      semesterNumber++;
    }
    const stuck = courses.filter((course) => !assigned.has(course));
    if (stuck.length) columns.push({ kind: "cycle", semester: null, courses: stuck });
    return columns.length ? columns : [{ kind: "semester", semester: 1, courses: [] }];
  }

  const planColumns = buildSemesterPlan();
  // The Python queue stores zero-based course indices. View snapshots convert
  // them to C1..Cn only for the graph, while debugger variables stay zero-based.
  let queue = [];
  let currentBatch = [];
  let nextQueue = [];
  let currentCourseIndex = null;
  let currentNeighborIndex = null;
  let activeEdge = null;
  let semester = 0;
  let count = 0;
  let loopSize = 0;
  let activeSemester = null;
  let batchActive = false;
  let semesterInitialized = false;
  let countInitialized = false;

  const displayCourses = (indices) => indices.map((index) => index + 1);

  function snapshot(event, phase, extra = {}) {
    return {
      event,
      phase,
      n,
      courses: [...courses],
      relations: relations.map((edge) => ({ ...edge })),
      planColumns: planColumns.map((column) => ({ ...column, courses: [...column.courses] })),
      builtEdgeKeys: [...builtEdgeKeys],
      processedEdgeKeys: [...processedEdgeKeys],
      indegree: [...indegree],
      queue: displayCourses(queue),
      queueIndices: [...queue],
      currentBatch: displayCourses(currentBatch),
      currentBatchIndices: [...currentBatch],
      nextQueue: displayCourses(nextQueue),
      nextQueueIndices: [...nextQueue],
      currentCourse: currentCourseIndex === null ? null : currentCourseIndex + 1,
      currentCourseIndex,
      currentNeighbor: currentNeighborIndex === null ? null : currentNeighborIndex + 1,
      currentNeighborIndex,
      activeEdge: activeEdge ? { ...activeEdge } : null,
      completed: [...completed],
      semester: semesterInitialized ? semester : null,
      activeSemester,
      taken: countInitialized ? count : 0,
      count: countInitialized ? count : null,
      loopSize,
      batchActive,
      semesterHistory: semesterHistory.map((item) => ({ semester: item.semester, courses: [...item.courses] })),
      answer: null,
      ...extra,
    };
  }

  function addStep({ event, phase, title, codeLines, vars = [], note, final = false, extra = {} }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      codeLines,
      vars,
      note,
      final,
      parallelCoursesView: snapshot(event, phase, extra),
    });
  }

  addStep({
    event: "init",
    phase: "build",
    title: { vi: `Gọi minimumSemesters với n = ${n}`, en: `Call minimumSemesters with n = ${n}` },
    codeLines: [2],
    vars: [{ name: "n", value: n }, { name: "relations", value: relations.length }],
    note: {
      vi: "Mỗi relation [u, v] nghĩa là phải hoàn thành môn u trước môn v.",
      en: "Each relation [u, v] means course u must be completed before course v.",
    },
  });
  addStep({
    event: "init-graph",
    phase: "build",
    title: { vi: "graph = defaultdict(list)", en: "graph = defaultdict(list)" },
    codeLines: [6],
    vars: [{ name: "graph", value: "{}" }],
    note: {
      vi: "graph[index] sẽ chứa các index môn được mở khóa sau môn hiện tại.",
      en: "graph[index] stores the course indices unlocked after the current course.",
    },
  });
  addStep({
    event: "init-indegree",
    phase: "build",
    title: { vi: "Khởi tạo mọi in-degree = 0", en: "Initialize every in-degree to 0" },
    codeLines: [8],
    vars: [{ name: "indegree", value: `[${indegree.join(", ")}]` }, { name: "length", value: n }],
    note: {
      vi: "Mảng có n phần tử; indegree[i] đếm số tiên quyết còn thiếu của môn i + 1.",
      en: "The array has n entries; indegree[i] counts unmet prerequisites for course i + 1.",
    },
  });

  for (const edge of relations) {
    activeEdge = edge;
    addStep({
      event: "read-relation",
      phase: "build",
      title: { vi: `Đọc relation ${edge.from} → ${edge.to}`, en: `Read relation ${edge.from} → ${edge.to}` },
      codeLines: [10],
      vars: [{ name: "u, v", value: `${edge.from}, ${edge.to}` }],
      note: {
        vi: `Môn ${edge.from} là tiên quyết trực tiếp của môn ${edge.to}.`,
        en: `Course ${edge.from} is a direct prerequisite of course ${edge.to}.`,
      },
    });

    const fromIndex = edge.from - 1;
    const toIndex = edge.to - 1;
    graph[fromIndex].push(edge);
    builtEdgeKeys.add(edge.key);
    addStep({
      event: "add-edge",
      phase: "build",
      title: { vi: `graph[${fromIndex}].append(${toIndex})`, en: `graph[${fromIndex}].append(${toIndex})` },
      codeLines: [11],
      vars: [{ name: `graph[${fromIndex}]`, value: `[${graph[fromIndex].map((item) => item.to - 1).join(", ")}]` }],
      note: {
        vi: `Input dùng môn ${edge.from} → ${edge.to}; code đổi sang index ${fromIndex} → ${toIndex}.`,
        en: `The input uses courses ${edge.from} → ${edge.to}; the code converts them to indices ${fromIndex} → ${toIndex}.`,
      },
    });

    const before = indegree[toIndex];
    indegree[toIndex]++;
    addStep({
      event: "increment-indegree",
      phase: "build",
      title: { vi: `indegree[${toIndex}]: ${before} → ${indegree[toIndex]}`, en: `indegree[${toIndex}]: ${before} → ${indegree[toIndex]}` },
      codeLines: [12],
      vars: [{ name: `indegree[${toIndex}]`, value: indegree[toIndex] }],
      note: {
        vi: `Môn ${edge.to} có thêm một tiên quyết chưa hoàn thành: môn ${edge.from}.`,
        en: `Course ${edge.to} has one more unmet prerequisite: course ${edge.from}.`,
      },
      extra: { indegreeBefore: before, indegreeAfter: indegree[toIndex] },
    });
  }
  activeEdge = null;

  addStep({
    event: "init-queue",
    phase: "seed",
    title: { vi: "queue = deque()", en: "queue = deque()" },
    codeLines: [14],
    vars: [{ name: "queue", value: "[]" }],
    note: { vi: "Tạo queue rỗng trước khi tìm các môn có indegree bằng 0.", en: "Create an empty queue before finding zero-indegree courses." },
  });

  for (let index = 0; index < n; index++) {
    currentCourseIndex = index;
    addStep({
      event: "seed-loop",
      phase: "seed",
      title: { vi: `for i: i = ${index}`, en: `for i: i = ${index}` },
      codeLines: [16],
      vars: [{ name: "i", value: index }, { name: "course", value: index + 1 }],
      note: { vi: `Index ${index} đại diện cho môn ${index + 1}.`, en: `Index ${index} represents course ${index + 1}.` },
    });

    const ready = indegree[index] === 0;
    addStep({
      event: ready ? "seed-check-ready" : "seed-check-blocked",
      phase: "seed",
      title: ready
        ? { vi: `indegree[${index}] == 0 → True`, en: `indegree[${index}] == 0 → True` }
        : { vi: `indegree[${index}] == 0 → False`, en: `indegree[${index}] == 0 → False` },
      codeLines: [17],
      vars: [
        { name: "i", value: index },
        { name: `indegree[${index}]`, value: indegree[index] },
        { name: "condition", value: ready },
        { name: "queue", value: `[${queue.join(", ")}]` },
      ],
      note: ready
        ? { vi: `Môn ${index + 1} không còn tiên quyết, nên dòng 18 sẽ thêm index ${index} vào queue.`, en: `Course ${index + 1} has no unmet prerequisite, so line 18 will enqueue index ${index}.` }
        : { vi: `Môn ${index + 1} còn ${indegree[index]} tiên quyết; bỏ qua dòng 18.`, en: `Course ${index + 1} has ${indegree[index]} unmet prerequisite(s); skip line 18.` },
      extra: { readyDecision: ready },
    });

    if (ready) {
      queue.push(index);
      addStep({
        event: "seed-ready",
        phase: "seed",
        title: { vi: `queue.append(${index})`, en: `queue.append(${index})` },
        codeLines: [18],
        vars: [{ name: "queue", value: `[${queue.join(", ")}]` }, { name: `index ${index}`, value: `course ${index + 1}` }],
        note: { vi: `Queue lưu index 0-based: ${index} chính là môn ${index + 1}.`, en: `The queue stores zero-based indices: ${index} is course ${index + 1}.` },
        extra: { readyDecision: true },
      });
    }
  }
  currentCourseIndex = null;

  semesterInitialized = true;
  addStep({
    event: "init-semester",
    phase: "seed",
    title: { vi: "semester = 0", en: "semester = 0" },
    codeLines: [20],
    vars: [{ name: "semester", value: 0 }],
    note: { vi: "Chưa xử lý xong layer nào nên semester bắt đầu bằng 0.", en: "No layer has completed yet, so semester starts at 0." },
  });

  countInitialized = true;
  addStep({
    event: "init-count",
    phase: "seed",
    title: { vi: "count = 0", en: "count = 0" },
    codeLines: [21],
    vars: [{ name: "count", value: 0 }],
    note: { vi: "count đếm số môn đã được pop và hoàn thành.", en: "count tracks courses that have been popped and completed." },
  });

  while (true) {
    const hasReadyCourse = queue.length > 0;
    addStep({
      event: "while-check",
      phase: hasReadyCourse ? "semester" : "check",
      title: hasReadyCourse
        ? { vi: `while queue → True`, en: `while queue → True` }
        : { vi: "queue rỗng → dừng BFS", en: "queue is empty → stop BFS" },
      codeLines: [22],
      vars: [{ name: "queue", value: `[${queue.join(", ")}]` }, { name: "condition", value: hasReadyCourse }],
      note: hasReadyCourse
        ? { vi: `Queue không rỗng; bắt đầu layer cho học kỳ ${semester + 1}.`, en: `The queue is not empty; begin the layer for semester ${semester + 1}.` }
        : { vi: "Không còn môn có in-degree bằng 0.", en: "No course with in-degree 0 remains." },
      extra: { hasReadyCourse },
    });
    if (!hasReadyCourse) break;

    activeSemester = semester + 1;
    loopSize = queue.length;
    const batch = queue.slice(0, loopSize);
    currentBatch = [...batch];
    nextQueue = [];
    batchActive = true;
    addStep({
      event: "capture-size",
      phase: "semester",
      title: { vi: `size = ${loopSize}: khóa batch [${batch.join(", ")}]`, en: `size = ${loopSize}: lock batch [${batch.join(", ")}]` },
      codeLines: [23],
      vars: [{ name: "size", value: loopSize }, { name: "queue", value: `[${queue.join(", ")}]` }, { name: "semester being built", value: activeSemester }],
      note: {
        vi: `size chốt ${loopSize} phần tử đầu queue cho học kỳ ${activeSemester}; phần tử append mới không được xử lý trong for này.`,
        en: `size locks the first ${loopSize} queue entries into semester ${activeSemester}; newly appended entries are excluded from this for loop.`,
      },
    });

    for (let slot = 0; slot < batch.length; slot++) {
      const curr = batch[slot];
      currentCourseIndex = curr;
      currentNeighborIndex = null;
      activeEdge = null;
      addStep({
        event: "batch-slot",
        phase: "semester",
        title: { vi: `for _: lượt ${slot + 1}/${loopSize}`, en: `for _: iteration ${slot + 1}/${loopSize}` },
        codeLines: [24],
        vars: [{ name: "_", value: slot }, { name: "size", value: loopSize }],
        note: { vi: `Đây là một trong đúng ${loopSize} lần pop của học kỳ ${activeSemester}.`, en: `This is one of exactly ${loopSize} pops in semester ${activeSemester}.` },
      });

      const popped = queue.shift();
      currentBatch.shift();
      addStep({
        event: "dequeue",
        phase: "semester",
        title: { vi: `curr = queue.popleft() → ${popped}`, en: `curr = queue.popleft() → ${popped}` },
        codeLines: [25],
        vars: [{ name: "curr", value: popped }, { name: "course", value: popped + 1 }, { name: "queue", value: `[${queue.join(", ")}]` }],
        note: { vi: `Pop index ${popped}, tức môn ${popped + 1}, khỏi đầu queue.`, en: `Pop index ${popped}, representing course ${popped + 1}, from the queue front.` },
      });

      count++;
      completed.add(curr + 1);
      addStep({
        event: "increment-count",
        phase: "semester",
        title: { vi: `count += 1 → ${count}`, en: `count += 1 → ${count}` },
        codeLines: [26],
        vars: [{ name: "count", value: `${count}/${n}` }, { name: "completed course", value: curr + 1 }],
        note: { vi: `Đã hoàn thành môn ${curr + 1}; count hiện là ${count}.`, en: `Course ${curr + 1} is complete; count is now ${count}.` },
      });

      for (const edge of graph[curr]) {
        const nei = edge.to - 1;
        currentNeighborIndex = nei;
        activeEdge = edge;
        addStep({
          event: "visit-dependent",
          phase: "relax",
          title: { vi: `for nei in graph[${curr}] → nei = ${nei}`, en: `for nei in graph[${curr}] → nei = ${nei}` },
          codeLines: [28],
          vars: [{ name: "curr", value: curr }, { name: "nei", value: nei }, { name: "edge", value: `${edge.from} → ${edge.to}` }],
          note: { vi: `Môn ${edge.from} đã xong, nên xét cập nhật môn phụ thuộc ${edge.to}.`, en: `Course ${edge.from} is complete, so update dependent course ${edge.to}.` },
        });

        const before = indegree[nei];
        indegree[nei]--;
        processedEdgeKeys.add(edge.key);
        addStep({
          event: "decrement-indegree",
          phase: "relax",
          title: { vi: `indegree[${nei}]: ${before} → ${indegree[nei]}`, en: `indegree[${nei}]: ${before} → ${indegree[nei]}` },
          codeLines: [29],
          vars: [{ name: `indegree[${nei}]`, value: indegree[nei] }],
          note: { vi: `Gỡ cạnh ${edge.from} → ${edge.to}; in-degree của ${edge.to} giảm một.`, en: `Remove edge ${edge.from} → ${edge.to}; ${edge.to}'s in-degree decreases by one.` },
          extra: { indegreeBefore: before, indegreeAfter: indegree[nei] },
        });

        const ready = indegree[nei] === 0;
        addStep({
          event: "ready-check",
          phase: "relax",
          title: ready
            ? { vi: `indegree[${nei}] == 0 → True`, en: `indegree[${nei}] == 0 → True` }
            : { vi: `indegree[${nei}] == 0 → False`, en: `indegree[${nei}] == 0 → False` },
          codeLines: [30],
          vars: [{ name: `indegree[${nei}]`, value: indegree[nei] }, { name: "condition", value: ready }],
          note: ready
            ? { vi: `Tất cả tiên quyết của môn ${edge.to} đã hoàn thành.`, en: `All prerequisites of course ${edge.to} are complete.` }
            : { vi: `Môn ${edge.to} còn ${indegree[nei]} tiên quyết chưa hoàn thành.`, en: `Course ${edge.to} still has ${indegree[nei]} unmet prerequisite(s).` },
          extra: { readyDecision: ready, indegreeBefore: before, indegreeAfter: indegree[nei] },
        });

        if (ready) {
          queue.push(nei);
          nextQueue.push(nei);
          addStep({
            event: "enqueue-next",
            phase: "relax",
            title: { vi: `queue.append(${nei})`, en: `queue.append(${nei})` },
            codeLines: [31],
            vars: [{ name: "queue", value: `[${queue.join(", ")}]` }, { name: "appended index", value: nei }, { name: "course", value: nei + 1 }],
            note: { vi: `Index ${nei} được append ngay, nhưng size=${loopSize} giữ nó lại cho học kỳ ${activeSemester + 1}.`, en: `Index ${nei} is appended now, but size=${loopSize} reserves it for semester ${activeSemester + 1}.` },
            extra: { readyDecision: true },
          });
        }
      }
    }

    const beforeSemester = semester;
    semester++;
    semesterHistory.push({ semester, courses: displayCourses(batch) });
    currentBatch = [];
    batchActive = false;
    currentCourseIndex = null;
    currentNeighborIndex = null;
    activeEdge = null;
    activeSemester = null;
    addStep({
      event: "semester-complete",
      phase: "semester",
      title: { vi: `semester += 1: ${beforeSemester} → ${semester}`, en: `semester += 1: ${beforeSemester} → ${semester}` },
      codeLines: [33],
      vars: [{ name: "semester", value: semester }, { name: "queue", value: `[${queue.join(", ")}]` }],
      note: queue.length
        ? { vi: `Đã xử lý xong đúng size=${loopSize} môn; queue [${queue.join(", ")}] dành cho học kỳ ${semester + 1}.`, en: `Exactly size=${loopSize} courses finished; queue [${queue.join(", ")}] belongs to semester ${semester + 1}.` }
        : { vi: `Đã xử lý xong đúng size=${loopSize} môn và queue hiện rỗng.`, en: `Exactly size=${loopSize} courses finished and the queue is now empty.` },
      extra: { justCompletedCourses: displayCourses(batch) },
    });
    nextQueue = [];
  }

  const allCompleted = count === n;
  const stuckCourses = courses.filter((course) => !completed.has(course));
  addStep({
    event: "result-check",
    phase: "check",
    title: allCompleted
      ? { vi: `count == n: ${count} == ${n} → True`, en: `count == n: ${count} == ${n} → True` }
      : { vi: `count == n: ${count} == ${n} → False`, en: `count == n: ${count} == ${n} → False` },
    codeLines: [35],
    vars: [
      { name: "count", value: count },
      { name: "n", value: n },
      { name: "condition", value: allCompleted },
    ],
    note: allCompleted
      ? { vi: "Mọi môn đều đã được pop khỏi queue; dòng 36 sẽ trả semester.", en: "Every course was popped from the queue; line 36 returns semester." }
      : { vi: `Chỉ xử lý được ${count}/${n} môn; đi vào nhánh else.`, en: `Only ${count}/${n} courses were processed; enter the else branch.` },
    extra: { allCompleted, stuckCourses },
  });

  if (!allCompleted) {
    addStep({
      event: "else-branch",
      phase: "check",
      title: { vi: "else: còn môn bị kẹt", en: "else: courses remain stuck" },
      codeLines: [37],
      vars: [{ name: "stuck courses", value: `[${stuckCourses.join(", ")}]` }],
      note: { vi: "Queue đã rỗng nhưng count < n, nên các môn còn lại nằm trong chu trình.", en: "The queue is empty while count < n, so the remaining courses are in a cycle." },
      extra: { allCompleted: false, stuckCourses },
    });
  }

  const answer = allCompleted ? semester : -1;
  addStep({
    event: allCompleted ? "done" : "cycle",
    phase: "done",
    title: allCompleted
      ? { vi: `return semester → ${semester}`, en: `return semester → ${semester}` }
      : { vi: "return -1", en: "return -1" },
    codeLines: [allCompleted ? 36 : 38],
    vars: [
      { name: "count", value: `${count}/${n}` },
      { name: "semester", value: semester },
      { name: "return", value: answer },
    ],
    note: allCompleted
      ? { vi: `Học hết ${n} môn trong ${semester} layer, nên trả ${semester}.`, en: `All ${n} courses finished in ${semester} layers, so return ${semester}.` }
      : { vi: `Các môn [${stuckCourses.join(", ")}] bị kẹt trong chu trình, nên trả -1.`, en: `Courses [${stuckCourses.join(", ")}] are stuck in a cycle, so return -1.` },
    final: true,
    extra: { answer, stuckCourses },
  });

  return { n, edges: relations.map((edge) => `${edge.from}-${edge.to}`), answer, steps };
}

/**
 * LeetCode 3620: Network Recovery Pathways.
 * Binary search the path score. For a candidate score x, keep only online nodes
 * and edges with cost >= x, then compute the cheapest 0 -> n-1 path on the DAG.
 */
function buildSteps3620(input, params) {
  const edgesRaw = String(input).split(",").map((e) => e.trim()).filter(Boolean);
  const edges = edgesRaw.map((e) => {
    const [u, v, w] = e.split("-").map((x) => Number(x.trim()));
    return { u, v, w };
  }).filter((e) => Number.isFinite(e.u) && Number.isFinite(e.v) && Number.isFinite(e.w));

  const online = String(params.online || "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((s) => s === "true" || s === "1" || s === "yes");

  let n = Number(params.n) || online.length || 0;
  for (const { u, v } of edges) n = Math.max(n, u + 1, v + 1);
  while (online.length < n) online.push(true);
  if (n > 0) {
    online[0] = true;
    online[n - 1] = true;
  }

  const k = Number(params.k) || 0;
  const nodes = Array.from({ length: n }, (_, i) => i);
  const adj = Array.from({ length: n }, () => []);
  const indeg = Array(n).fill(0);
  for (const edge of edges) {
    if (edge.u >= 0 && edge.u < n && edge.v >= 0 && edge.v < n) {
      adj[edge.u].push(edge);
      indeg[edge.v]++;
    }
  }

  const topo = [];
  const q = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  for (let head = 0; head < q.length; head++) {
    const u = q[head];
    topo.push(u);
    for (const { v } of adj[u]) {
      indeg[v]--;
      if (indeg[v] === 0) q.push(v);
    }
  }
  if (topo.length < n) {
    for (let i = 0; i < n; i++) if (!topo.includes(i)) topo.push(i);
  }

  const steps = [];
  const fmtCost = (x) => (x === Infinity ? "∞" : x);
  const costStr = (dist) => nodes.map((id) => `${id}:${fmtCost(dist[id])}`).join(", ");
  const onlineStr = online.map((v, i) => `${i}:${v ? "on" : "off"}`).join(", ");
  const isUsableNode = (node) => node === 0 || node === n - 1 || online[node];

  function makeGraph(dist, hlNodes, hlEdges, visitedNodes) {
    return {
      nodes: nodes.map((id) => ({
        id,
        dist: online[id] ? fmtCost(dist?.[id] ?? Infinity) : "off",
      })),
      edges,
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: visitedNodes || [],
    };
  }

  function check(score, capture) {
    const dist = Array(n).fill(Infinity);
    const prev = Array(n).fill(null);
    const processed = [];
    if (n > 0) dist[0] = 0;

    if (capture) {
      steps.push({
        title: { vi: `Thử score >= ${score}`, en: `Try score >= ${score}` },
        arr: [],
        graph: makeGraph(dist, [0], edges.filter((e) => e.w >= score).map((e) => [e.u, e.v]), []),
        highlight: [],
        mark: [],
        codeLines: [12, 13, 14, 15],
        vars: [
          { name: "candidate score", value: score },
          { name: "k", value: k },
          { name: "online", value: `{${onlineStr}}` },
        ],
        note: {
          vi:
            `Kiểm tra có path 0→${n - 1} nào dùng toàn cạnh cost >= ${score}, đi qua node online, ` +
            `và tổng cost <= ${k} không.`,
          en:
            `Check whether a 0→${n - 1} path can use only edges with cost >= ${score}, online nodes, ` +
            `and total cost <= ${k}.`,
        },
      });
    }

    for (const u of topo) {
      if (!isUsableNode(u) || dist[u] === Infinity) continue;
      processed.push(u);
      const relaxed = [];
      const blocked = [];

      for (const edge of adj[u]) {
        const { v, w } = edge;
        if (!isUsableNode(v)) {
          blocked.push(`${u}→${v} offline`);
          continue;
        }
        if (w < score) {
          blocked.push(`${u}→${v} cost ${w}<${score}`);
          continue;
        }
        const nd = dist[u] + w;
        if (nd < dist[v]) {
          dist[v] = nd;
          prev[v] = u;
          relaxed.push([u, v]);
        }
      }

      if (capture && (relaxed.length || blocked.length || u === 0 || u === n - 1)) {
        steps.push({
          title: { vi: `DP tại node ${u}`, en: `DP at node ${u}` },
          arr: [],
          graph: makeGraph(dist, [u], relaxed, processed.slice()),
          highlight: [],
          mark: [],
          codeLines: [16, 17, 18, 19, 20, 21, 22],
          vars: [
            { name: "u", value: u },
            { name: "dist[u]", value: fmtCost(dist[u]) },
            { name: "relaxed", value: relaxed.map(([a, b]) => `${a}→${b}`).join(", ") || "none" },
            { name: "blocked", value: blocked.slice(0, 4).join(", ") || "none" },
            { name: "dist", value: `{${costStr(dist)}}` },
          ],
          note: {
            vi:
              `Duyệt node ${u} theo topo order. Chỉ relax cạnh đủ mạnh (cost >= ${score}) và đi tới node online.\n` +
              `Chi phí tốt nhất hiện tại tới ${n - 1}: ${fmtCost(dist[n - 1])}.`,
            en:
              `Process node ${u} in topological order. Relax only strong enough edges (cost >= ${score}) into online nodes.\n` +
              `Current best cost to ${n - 1}: ${fmtCost(dist[n - 1])}.`,
          },
        });
      }
    }

    const ok = dist[n - 1] <= k;
    const pathEdges = [];
    if (ok) {
      let cur = n - 1;
      while (prev[cur] !== null) {
        pathEdges.push([prev[cur], cur]);
        cur = prev[cur];
      }
      pathEdges.reverse();
    }

    if (capture) {
      steps.push({
        title: {
          vi: ok ? `Score ${score} hợp lệ` : `Score ${score} không hợp lệ`,
          en: ok ? `Score ${score} is feasible` : `Score ${score} is not feasible`,
        },
        arr: [],
        graph: makeGraph(dist, ok ? [0, n - 1] : [n - 1], pathEdges, processed),
        highlight: [],
        mark: [],
        codeLines: [23, 24],
        vars: [
          { name: "best cost to target", value: fmtCost(dist[n - 1]) },
          { name: "k", value: k },
          { name: "feasible", value: ok },
        ],
        note: {
          vi: ok
            ? `Có path tổng cost ${dist[n - 1]} <= ${k}. Candidate ${score} có thể là đáp án hoặc còn tăng được.`
            : `Không có path nào đạt score ${score} với tổng cost <= ${k}. Phải thử score nhỏ hơn.`,
          en: ok
            ? `Found a path with total cost ${dist[n - 1]} <= ${k}. Candidate ${score} may be the answer or can go higher.`
            : `No path reaches score ${score} with total cost <= ${k}. Try a smaller score.`,
        },
      });
    }

    return { ok, dist, pathEdges };
  }

  const scores = [...new Set(edges.map((e) => e.w))].sort((a, b) => a - b);
  steps.push({
    title: { vi: "Khởi tạo binary search", en: "Initialize binary search" },
    arr: scores,
    graph: makeGraph(Array(n).fill(Infinity), [0, n - 1], [], []),
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6, 7, 8, 9, 10],
    vars: [
      { name: "n", value: n },
      { name: "edges", value: edges.length },
      { name: "k", value: k },
      { name: "candidate scores", value: `[${scores.join(", ")}]` },
    ],
    note: {
      vi:
        `Score của một path là cạnh nhỏ nhất trên path, nên đáp án chỉ có thể là một cost cạnh.\n` +
        `Binary search trên các cost cạnh. Với mỗi score X, chạy DP shortest path trên DAG đã lọc.`,
      en:
        `A path score is its minimum edge cost, so the answer must be one of the edge costs.\n` +
        `Binary search edge costs. For each score X, run shortest-path DP on the filtered DAG.`,
    },
  });

  let lo = 0;
  let hi = scores.length - 1;
  let answer = -1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const score = scores[mid];
    const { ok } = check(score, true);
    if (ok) {
      answer = score;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const finalRun = answer >= 0 ? check(answer, false) : { dist: Array(n).fill(Infinity), pathEdges: [] };
  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: scores,
    graph: makeGraph(finalRun.dist, answer >= 0 ? [0, n - 1] : [], finalRun.pathEdges, []),
    highlight: answer >= 0 ? [scores.indexOf(answer)] : [],
    mark: [],
    final: true,
    codeLines: [25, 26, 27],
    vars: [
      { name: "answer", value: answer },
      { name: "best path cost", value: answer >= 0 ? fmtCost(finalRun.dist[n - 1]) : "none" },
    ],
    note: {
      vi: answer >= 0
        ? `Score lớn nhất tìm được là ${answer}. Đường được highlight có mọi cạnh >= ${answer} và tổng cost <= ${k}.`
        : `Không tồn tại path hợp lệ từ 0 tới ${n - 1} với các node trung gian online và tổng cost <= ${k}.`,
      en: answer >= 0
        ? `The maximum feasible score is ${answer}. The highlighted path uses only edges >= ${answer} and total cost <= ${k}.`
        : `No valid path exists from 0 to ${n - 1} with online intermediate nodes and total cost <= ${k}.`,
    },
  });

  return { n, edges: edgesRaw, online, k, answer, steps };
}

/**
 * LeetCode 2492: Minimum Score of a Path Between Two Cities — Union-Find.
 *
 * Key insight: since paths may revisit nodes/edges, the reachable set from
 * city 1 is exactly its connected component. ANY edge inside that component
 * can appear on SOME path from 1 to n (walk there, cross it, walk back).
 * So the answer = the minimum edge weight among all edges whose endpoints
 * lie in city 1's connected component.
 *
 * Algorithm:
 *   1) Union every edge (a, b) regardless of weight — this just discovers
 *      which cities are reachable from each other.
 *   2) Find root = find(1).
 *   3) Re-scan all edges; for any edge with an endpoint in root's component,
 *      take the min weight.
 */
// ─── 1319 DFS: Number of Operations to Make Network Connected ───
function buildSteps1319DFS(input, params) {
  const n = params.n !== undefined ? Number(params.n) : 4;
  const edgeList = String(input).split(";").map((s) => {
    const parts = s.trim().split(",").map(Number);
    return [parts[0], parts[1]];
  }).filter((e) => !isNaN(e[0]) && !isNaN(e[1]));

  const steps = [];

  // Build adjacency list
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edgeList) {
    adj[a].push(b);
    adj[b].push(a);
  }

  const allNodes = Array.from({ length: n }, (_, i) => i);
  const allEdges = edgeList.map(([a, b]) => ({ u: a, v: b, w: "" }));

  function makeGraph(hlNodes, hlEdges, visitedNodes) {
    return {
      nodes: allNodes.map(id => ({ id, label: String(id) })),
      edges: allEdges,
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: visitedNodes || [],
    };
  }

  const visited = new Set();
  let components = 0;
  const impossible = edgeList.length < n - 1;

  // ── Step 0: feasibility check ──────────────────────────────────────
  steps.push({
    title: { en: "Step 1: feasibility check", vi: "Bước 1: kiểm tra khả thi" },
    arr: [],
    graph: makeGraph([], [], []),
    highlight: [], mark: [],
    codeLines: [5, 6],
    vars: [
      { name: "n (computers)", value: n },
      { name: "cables", value: edgeList.length },
      { name: "min needed (n-1)", value: n - 1 },
      { name: "feasible?", value: !impossible },
    ],
    note: {
      en: `${n} computers, ${edgeList.length} cables. Need ≥ n-1 = ${n-1} cables to connect all. ` +
          (impossible ? `${edgeList.length} < ${n-1} → impossible, return -1.` : `${edgeList.length} ≥ ${n-1} → may be possible. Count components via DFS.`),
      vi: `${n} máy tính, ${edgeList.length} cáp. Cần ≥ n-1 = ${n-1} cáp. ` +
          (impossible ? `${edgeList.length} < ${n-1} → không thể, trả -1.` : `${edgeList.length} ≥ ${n-1} → có thể. Đếm components bằng DFS.`),
    },
  });

  if (impossible) {
    const fs = {
      title: { en: "Result: -1 (not enough cables)", vi: "Kết quả: -1 (không đủ cáp)" },
      arr: [], graph: makeGraph([], [], []),
      highlight: [], mark: [], final: true, codeLines: [5, 6],
      vars: [{ name: "answer", value: -1 }],
      note: { en: "Impossible: return -1.", vi: "Không thể: trả -1." },
    };
    fs.final = true;
    steps.push(fs);
    return { input, answer: -1, steps };
  }

  // ── Step 1: show graph + init ─────────────────────────────────────
  steps.push({
    title: { en: "Build graph, init visited = {}", vi: "Xây đồ thị, khởi tạo visited = {}" },
    arr: [],
    graph: makeGraph([], [], []),
    highlight: [], mark: [],
    codeLines: [7, 8, 9, 10, 11],
    vars: [
      { name: "visited", value: "{}" },
      { name: "components", value: 0 },
      { name: "graph edges", value: edgeList.map(([a,b]) => `${a}↔${b}`).join(", ") },
    ],
    note: {
      en: `Build adjacency list. DFS from each unvisited node discovers one full component and increments components.`,
      vi: `Xây adjacency list. DFS từ mỗi nút chưa thăm khám phá 1 component và tăng components.`,
    },
  });

  // ── DFS per component ────────────────────────────────────────────
  for (let start = 0; start < n; start++) {
    if (visited.has(start)) continue;

    // Show: entering loop for this start node
    steps.push({
      title: { en: `i=${start}: not in visited → DFS`, vi: `i=${start}: chưa thăm → DFS` },
      arr: [],
      graph: makeGraph([start], [], [...visited]),
      highlight: [], mark: [],
      codeLines: [20, 21, 22],
      vars: [
        { name: "i", value: start },
        { name: "visited", value: `{${[...visited].join(", ")}}` || "{}" },
        { name: "components", value: components },
      ],
      note: {
        en: `Node ${start} not yet visited. Add to visited, call dfs(${start}) to discover its component.`,
        vi: `Node ${start} chưa thăm. Thêm vào visited, gọi dfs(${start}) để khám phá nhóm.`,
      },
    });

    // Iterative DFS
    visited.add(start);
    const stack = [start];
    const componentNodes = [start];

    while (stack.length > 0) {
      const node = stack.pop();
      const unvisitedNeighbors = adj[node].filter(nb => !visited.has(nb));

      steps.push({
        title: { en: `dfs: pop node ${node}`, vi: `dfs: lấy node ${node} ra khỏi stack` },
        arr: [],
        graph: makeGraph([node], adj[node].map(nb => `${Math.min(node,nb)}-${Math.max(node,nb)}`), [...visited]),
        highlight: [], mark: [],
        codeLines: [13, 14, 15, 16, 17, 18],
        vars: [
          { name: "cur", value: node },
          { name: "neighbors", value: `[${adj[node].join(", ")}]` },
          { name: "unvisited", value: unvisitedNeighbors.length > 0 ? `[${unvisitedNeighbors.join(", ")}]` : "none" },
          { name: "stack", value: `[${stack.join(", ")}]` },
          { name: "visited", value: `{${[...visited].join(", ")}}` },
        ],
        note: {
          en: `Pop node ${node} from stack. Check neighbors [${adj[node].join(", ")}]. Unvisited: [${unvisitedNeighbors.join(", ") || "none"}] → push to stack.`,
          vi: `Lấy node ${node} từ stack. Kiểm tra hàng xóm [${adj[node].join(", ")}]. Chưa thăm: [${unvisitedNeighbors.join(", ") || "none"}] → đẩy vào stack.`,
        },
      });

      for (const nb of unvisitedNeighbors) {
        visited.add(nb);
        stack.push(nb);
        componentNodes.push(nb);
      }
    }

    components++;

    steps.push({
      title: { en: `Component ${components} done: [${componentNodes.join(", ")}]`, vi: `Component ${components} xong: [${componentNodes.join(", ")}]` },
      arr: [],
      graph: makeGraph(componentNodes, [], [...visited]),
      highlight: [], mark: [],
      codeLines: [23],
      vars: [
        { name: "component", value: `[${componentNodes.join(", ")}]` },
        { name: "components", value: components },
        { name: "visited", value: `{${[...visited].join(", ")}}` },
      ],
      note: {
        en: `DFS from node ${start} finished. Component ${components} = [${componentNodes.join(", ")}]. ${n - visited.size} computer(s) not yet visited.`,
        vi: `DFS từ node ${start} xong. Component ${components} = [${componentNodes.join(", ")}]. Còn ${n - visited.size} máy tính chưa thăm.`,
      },
    });
  }

  // ── Final ─────────────────────────────────────────────────────────
  const answer = components - 1;
  const fs = {
    title: { en: `Result: ${answer} operation(s)`, vi: `Kết quả: ${answer} thao tác` },
    arr: [],
    graph: makeGraph([], [], [...visited]),
    highlight: [], mark: [],
    final: true,
    codeLines: [24],
    vars: [
      { name: "components", value: components },
      { name: "answer = components - 1", value: `${components} - 1 = ${answer}` },
    ],
    note: {
      en: `${components} component(s) found. Need ${answer} cable move(s) to connect them all into one network.`,
      vi: `Tìm thấy ${components} nhóm. Cần ${answer} lần chuyển cáp để nối tất cả thành 1 mạng.`,
    },
  };
  steps.push(fs);

  return { input, answer, steps };
}

/**
 * LeetCode 1971: Find if Path Exists in Graph.
 * Iterative DFS from source; return true as soon as destination is popped/found,
 * otherwise false once the stack is exhausted. One code line highlighted per step.
 */
function buildSteps1971(input, params) {
  const n = params && params.n !== undefined ? Number(params.n) : 6;
  const source = params && params.source !== undefined ? Number(params.source) : 0;
  const destination = params && params.destination !== undefined ? Number(params.destination) : 5;
  const edgeList = String(input || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(",").map(Number))
    .filter((e) => e.length === 2 && !e.some(Number.isNaN));

  const steps = [];
  const adj = Array.from({ length: n }, () => []);
  const allNodes = Array.from({ length: n }, (_, id) => id);
  const allEdges = [];

  function visitedList(visited) {
    return allNodes.filter((id) => visited[id]);
  }

  function makeGraph(hlNodes = [], hlEdges = [], visited = []) {
    return {
      nodes: allNodes.map((id) => ({ id, label: String(id) })),
      edges: allEdges.slice(),
      hlNodes,
      hlEdges,
      visitedNodes: visited,
    };
  }

  function push({ title, hlNodes, hlEdges, visited, codeLines, vars, note, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(hlNodes, hlEdges, visited),
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  push({
    title: { vi: "Ý tưởng: DFS từ source, tìm destination", en: "Idea: DFS from source, look for destination" },
    hlNodes: [source, destination],
    codeLines: [2],
    vars: [{ name: "n", value: n }, { name: "source", value: source }, { name: "destination", value: destination }],
    note: {
      vi: "Chỉ cần kiểm tra source và destination có nằm cùng connected component không.",
      en: "Just check whether source and destination lie in the same connected component.",
    },
  });

  // Line 3-4: source == destination shortcut
  if (source === destination) {
    push({
      title: { vi: "source == destination? True", en: "source == destination? True" },
      hlNodes: [source],
      codeLines: [3],
      vars: [{ name: "source", value: source }, { name: "destination", value: destination }],
      note: { vi: "source và destination là cùng một đỉnh.", en: "source and destination are the same node." },
    });
    push({
      title: { vi: "return True", en: "return True" },
      hlNodes: [source],
      final: true,
      codeLines: [4],
      vars: [{ name: "answer", value: true }],
      note: { vi: "Không cần di chuyển gì cả, đã ở đích.", en: "No movement needed, already at the destination." },
    });
    return { n, edges: edgeList, source, destination, answer: true, steps };
  }
  push({
    title: { vi: "source == destination? False", en: "source == destination? False" },
    hlNodes: [source, destination],
    codeLines: [3],
    vars: [{ name: "source", value: source }, { name: "destination", value: destination }],
    note: { vi: "Hai đỉnh khác nhau, cần DFS để kiểm tra kết nối.", en: "Different nodes, need DFS to check connectivity." },
  });

  // Line 5: adj = [[] for _ in range(n)]
  push({
    title: { vi: "adj = [[] for _ in range(n)]", en: "adj = [[] for _ in range(n)]" },
    codeLines: [5],
    vars: [{ name: "adj", value: `${n} danh sách rỗng` }],
    note: { vi: `Tạo adjacency list rỗng cho ${n} đỉnh.`, en: `Create an empty adjacency list for ${n} nodes.` },
  });

  for (const [a, b] of edgeList) {
    push({
      title: { vi: `for a, b in edges: a,b = ${a},${b}`, en: `for a, b in edges: a,b = ${a},${b}` },
      hlNodes: [a, b],
      codeLines: [6],
      vars: [{ name: "a", value: a }, { name: "b", value: b }],
      note: { vi: `Xét cạnh vô hướng (${a}, ${b}).`, en: `Process undirected edge (${a}, ${b}).` },
    });
    adj[a].push(b);
    push({
      title: { vi: `adj[${a}].append(${b})`, en: `adj[${a}].append(${b})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [7],
      vars: [{ name: `adj[${a}]`, value: `[${adj[a].join(", ")}]` }],
      note: { vi: `Thêm ${b} vào danh sách kề của ${a}.`, en: `Add ${b} to ${a}'s adjacency list.` },
    });
    adj[b].push(a);
    allEdges.push({ u: a, v: b, w: "" });
    push({
      title: { vi: `adj[${b}].append(${a})`, en: `adj[${b}].append(${a})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [8],
      vars: [{ name: `adj[${b}]`, value: `[${adj[b].join(", ")}]` }],
      note: { vi: `Thêm ${a} vào danh sách kề của ${b}.`, en: `Add ${a} to ${b}'s adjacency list.` },
    });
  }

  const visited = new Array(n).fill(false);

  // Line 9: visited = [False] * n
  push({
    title: { vi: "visited = [False] * n", en: "visited = [False] * n" },
    codeLines: [9],
    vars: [{ name: "visited", value: `[${visited.map(() => "F").join(", ")}]` }],
    note: { vi: "Ban đầu chưa thăm đỉnh nào.", en: "Initially, no node has been visited." },
  });

  // Line 10: stack = [source]
  const stack = [source];
  push({
    title: { vi: `stack = [${source}]`, en: `stack = [${source}]` },
    hlNodes: [source],
    codeLines: [10],
    vars: [{ name: "stack", value: `[${source}]` }],
    note: { vi: `Đưa source (${source}) vào stack DFS.`, en: `Push source (${source}) onto the DFS stack.` },
  });

  // Line 11: visited[source] = True
  visited[source] = true;
  push({
    title: { vi: `visited[${source}] = True`, en: `visited[${source}] = True` },
    hlNodes: [source],
    visited: visitedList(visited),
    codeLines: [11],
    vars: [{ name: "visited[source]", value: true }],
    note: { vi: `Đánh dấu source (${source}) đã thăm.`, en: `Mark source (${source}) visited.` },
  });

  let found = false;

  while (stack.length) {
    // Line 12: while stack
    push({
      title: { vi: `while stack: stack không rỗng`, en: `while stack: stack is non-empty` },
      visited: visitedList(visited),
      codeLines: [12],
      vars: [{ name: "stack", value: `[${stack.join(", ")}]` }],
      note: { vi: "Còn đỉnh trong stack, tiếp tục DFS.", en: "Stack still has nodes, keep exploring." },
    });

    // Line 13: node = stack.pop()
    const node = stack.pop();
    push({
      title: { vi: `node = stack.pop() = ${node}`, en: `node = stack.pop() = ${node}` },
      hlNodes: [node],
      visited: visitedList(visited),
      codeLines: [13],
      vars: [{ name: "node", value: node }, { name: "stack", value: `[${stack.join(", ")}]` }],
      note: { vi: `Lấy đỉnh ${node} ra khỏi stack để xử lý.`, en: `Pop node ${node} from the stack to process.` },
    });

    // Line 14: if node == destination
    const isDest = node === destination;
    push({
      title: { vi: `node == destination? ${isDest ? "True" : "False"}`, en: `node == destination? ${isDest ? "True" : "False"}` },
      hlNodes: [node, destination],
      visited: visitedList(visited),
      codeLines: [14],
      vars: [{ name: "node", value: node }, { name: "destination", value: destination }],
      note: {
        vi: isDest ? `Đã tới destination (${destination})!` : `${node} chưa phải destination (${destination}).`,
        en: isDest ? `Reached destination (${destination})!` : `${node} is not the destination (${destination}) yet.`,
      },
    });
    if (isDest) {
      // Line 15: return True
      push({
        title: { vi: "return True", en: "return True" },
        hlNodes: [node],
        visited: visitedList(visited),
        final: true,
        codeLines: [15],
        vars: [{ name: "answer", value: true }],
        note: { vi: "Có đường đi từ source tới destination.", en: "A path exists from source to destination." },
      });
      found = true;
      break;
    }

    // Line 16: for nb in adj[node]
    push({
      title: { vi: `for nb in adj[${node}]: [${adj[node].join(", ")}]`, en: `for nb in adj[${node}]: [${adj[node].join(", ")}]` },
      hlNodes: [node],
      hlEdges: adj[node].map((nb) => [node, nb]),
      visited: visitedList(visited),
      codeLines: [16],
      vars: [{ name: "neighbors", value: `[${adj[node].join(", ")}]` }],
      note: { vi: `Duyệt các hàng xóm của ${node}.`, en: `Iterate over ${node}'s neighbors.` },
    });

    for (const nb of adj[node]) {
      const already = visited[nb];
      push({
        title: { vi: `visited[${nb}]? ${already ? "True → bỏ qua" : "False → thăm"}`, en: `visited[${nb}]? ${already ? "True → skip" : "False → visit"}` },
        hlNodes: [node, nb],
        hlEdges: [[node, nb]],
        visited: visitedList(visited),
        codeLines: [17],
        vars: [{ name: "nb", value: nb }, { name: "visited[nb]", value: already }],
        note: {
          vi: already ? `${nb} đã thăm, không cần push lại.` : `${nb} chưa thăm, sẽ đánh dấu và push vào stack.`,
          en: already ? `${nb} already visited, no need to push again.` : `${nb} unvisited, will mark and push onto the stack.`,
        },
      });
      if (!already) {
        visited[nb] = true;
        push({
          title: { vi: `visited[${nb}] = True`, en: `visited[${nb}] = True` },
          hlNodes: [nb],
          visited: visitedList(visited),
          codeLines: [18],
          vars: [{ name: "visited[nb]", value: true }],
          note: { vi: `Đánh dấu ${nb} đã thăm.`, en: `Mark ${nb} visited.` },
        });
        stack.push(nb);
        push({
          title: { vi: `stack.append(${nb})`, en: `stack.append(${nb})` },
          hlNodes: [nb],
          visited: visitedList(visited),
          codeLines: [19],
          vars: [{ name: "stack", value: `[${stack.join(", ")}]` }],
          note: { vi: `Đưa ${nb} vào stack để xử lý sau.`, en: `Push ${nb} onto the stack to process later.` },
        });
      }
    }
  }

  if (!found) {
    // Line 12 check false, then line 20 return False
    push({
      title: { vi: "while stack: stack rỗng", en: "while stack: stack is empty" },
      visited: visitedList(visited),
      codeLines: [12],
      vars: [{ name: "stack", value: "[]" }],
      note: { vi: "Stack rỗng, đã duyệt hết component chứa source.", en: "Stack empty, the whole component containing source has been explored." },
    });
    push({
      title: { vi: "return False", en: "return False" },
      visited: visitedList(visited),
      final: true,
      codeLines: [20],
      vars: [{ name: "answer", value: false }],
      note: {
        vi: `destination (${destination}) không nằm trong component chứa source (${source}).`,
        en: `destination (${destination}) is not in the component containing source (${source}).`,
      },
    });
  }

  return { n, edges: edgeList, source, destination, answer: found, steps };
}

/**
 * LeetCode 133: Clone Graph.
 * Recursive DFS + hashmap: visited[curr] = clone lets us handle cycles —
 * register the clone BEFORE recursing into neighbors, so a cycle back to
 * curr finds the (partially built) clone instead of looping forever.
 * Line-by-line trace of the exact Python code shown to the user:
 *  1  class Node:
 *  2      def __init__(self, val=0, neighbors=None):
 *  3          self.val = val
 *  4          self.neighbors = neighbors if neighbors is not None else []
 *  5  class Solution:
 *  6      def cloneGraph(self, node):
 *  7          if not node:
 *  8              return None
 *  9          visited = {}
 * 10          def dfs(curr):
 * 11              if curr in visited:
 * 12                  return visited[curr]
 * 13              clone = Node(curr.val)
 * 14              visited[curr] = clone
 * 15              for nei in curr.neighbors:
 * 16                  clone.neighbors.append(dfs(nei))
 * 17              return clone
 * 18          return dfs(node)
 */
function buildSteps133(input, params) {
  const n = params && params.n !== undefined ? Number(params.n) : 4;
  const start = params && params.start !== undefined ? Number(params.start) : 1;
  const edgeList = String(input || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(",").map(Number))
    .filter((e) => e.length === 2 && !e.some(Number.isNaN));

  const steps = [];
  // 1-indexed adjacency: values 1..n
  const adj = {};
  for (let v = 1; v <= n; v++) adj[v] = [];
  for (const [a, b] of edgeList) {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  }

  const CLONE_OFFSET = 1000;
  const cloneAdj = {}; // origId -> [cloneNeighborIds built so far]
  const visited = new Map(); // origId -> cloneId (registered as soon as clone is created)

  function currentNodes() {
    const originals = Array.from({ length: n }, (_, i) => ({ id: i + 1, label: String(i + 1) }));
    const clones = [...visited.keys()].map((origId) => ({ id: CLONE_OFFSET + origId, label: `${origId}'` }));
    return [...originals, ...clones];
  }
  function currentEdges() {
    const gEdges = [];
    const seen = new Set();
    for (const [a, b] of edgeList) {
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (!seen.has(key)) { seen.add(key); gEdges.push({ u: a, v: b, w: "" }); }
    }
    // mapping edges: orig -> its clone
    for (const origId of visited.keys()) gEdges.push({ u: origId, v: CLONE_OFFSET + origId, w: "" });
    // clone-to-clone edges built so far
    for (const [origId, nbrs] of Object.entries(cloneAdj)) {
      for (const cNbr of nbrs) gEdges.push({ u: CLONE_OFFSET + Number(origId), v: cNbr, w: "" });
    }
    return gEdges;
  }
  function visitedNodeIds() {
    return [...visited.keys()].map((origId) => CLONE_OFFSET + origId);
  }

  function push({ hlNodes = [], hlEdges = [], title, note, vars, codeLines, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: { nodes: currentNodes(), edges: currentEdges(), hlNodes, hlEdges, visitedNodes: visitedNodeIds() },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars: vars || [],
      note,
    });
  }

  push({
    title: { vi: "Ý tưởng: DFS đệ quy + hashmap visited", en: "Idea: recursive DFS + visited hashmap" },
    hlNodes: [start],
    codeLines: [6],
    vars: [{ name: "n", value: n }, { name: "start", value: start }],
    note: {
      vi:
        "visited[curr] lưu clone tương ứng, được gán NGAY khi tạo clone, TRƯỚC khi đệ quy vào hàng xóm.\n" +
        "Nhờ vậy nếu đồ thị có chu trình quay lại curr, ta trả về clone đã có, không đệ quy vô hạn.",
      en:
        "visited[curr] stores curr's clone, assigned RIGHT AFTER creating it, BEFORE recursing into neighbors.\n" +
        "So if a cycle loops back to curr, we return the existing clone instead of recursing forever.",
    },
  });

  // Line 7-8: if not node / return None
  push({
    title: { vi: `node? Có (giá trị ${start}) → không None`, en: `node? Present (value ${start}) → not None` },
    hlNodes: [start],
    codeLines: [7],
    vars: [{ name: "node", value: start }],
    note: { vi: "Đồ thị đầu vào không rỗng, tiếp tục.", en: "Input graph is non-empty, proceed." },
  });

  // Line 9: visited = {}
  push({
    title: { vi: "visited = {}", en: "visited = {}" },
    codeLines: [9],
    vars: [{ name: "visited", value: "{}" }],
    note: { vi: "Hashmap: node gốc → node clone tương ứng.", en: "Hashmap: original node → its clone." },
  });

  push({
    title: { vi: "Định nghĩa dfs(curr)", en: "Define dfs(curr)" },
    codeLines: [10],
    vars: [],
    note: { vi: "Hàm đệ quy sẽ clone curr rồi clone toàn bộ hàng xóm.", en: "The recursive function clones curr, then clones all its neighbors." },
  });

  function dfs(curr) {
    // Line 11: if curr in visited
    const already = visited.has(curr);
    push({
      title: { vi: `dfs(${curr}): curr in visited? ${already}`, en: `dfs(${curr}): curr in visited? ${already}` },
      hlNodes: already ? [curr, CLONE_OFFSET + curr] : [curr],
      codeLines: [11],
      vars: [{ name: "curr", value: curr }, { name: "in visited?", value: already }],
      note: {
        vi: already
          ? `${curr} đã được clone trước đó (có thể do chu trình) → dùng lại clone cũ, tránh đệ quy vô hạn.`
          : `${curr} chưa được clone → tạo clone mới.`,
        en: already
          ? `${curr} was already cloned before (possibly due to a cycle) → reuse the existing clone, avoiding infinite recursion.`
          : `${curr} not cloned yet → create a new clone.`,
      },
    });
    if (already) {
      // Line 12: return visited[curr]
      const cloneId = visited.get(curr);
      push({
        title: { vi: `return visited[${curr}] → clone ${curr}'`, en: `return visited[${curr}] → clone ${curr}'` },
        hlNodes: [curr, cloneId],
        codeLines: [12],
        vars: [{ name: "returns", value: `${curr}'` }],
        note: { vi: "Trả về clone đã tồn tại, không tạo thêm.", en: "Return the existing clone, no new allocation." },
      });
      return cloneId;
    }

    // Line 13: clone = Node(curr.val)  (not yet registered in `visited`, so it won't render until line 14)
    const cloneId = CLONE_OFFSET + curr;
    push({
      title: { vi: `clone = Node(${curr}) → tạo clone ${curr}'`, en: `clone = Node(${curr}) → create clone ${curr}'` },
      hlNodes: [curr],
      codeLines: [13],
      vars: [{ name: "clone.val", value: curr }],
      note: { vi: `Tạo node clone mới mang giá trị ${curr}.`, en: `Create a new clone node with value ${curr}.` },
    });

    // Line 14: visited[curr] = clone
    visited.set(curr, cloneId);
    cloneAdj[curr] = [];
    push({
      title: { vi: `visited[${curr}] = clone ${curr}'`, en: `visited[${curr}] = clone ${curr}'` },
      hlNodes: [curr, cloneId],
      hlEdges: [[curr, cloneId]],
      codeLines: [14],
      vars: [{ name: `visited[${curr}]`, value: `${curr}'` }],
      note: {
        vi: "Đăng ký clone NGAY, trước khi đệ quy vào hàng xóm — chìa khóa để xử lý chu trình.",
        en: "Register the clone RIGHT AWAY, before recursing into neighbors — the key to handling cycles.",
      },
    });

    // Line 15: for nei in curr.neighbors
    for (const nei of adj[curr]) {
      push({
        title: { vi: `for nei in ${curr}.neighbors: nei = ${nei}`, en: `for nei in ${curr}.neighbors: nei = ${nei}` },
        hlNodes: [curr, nei],
        hlEdges: [[curr, nei]],
        codeLines: [15],
        vars: [{ name: "curr", value: curr }, { name: "nei", value: nei }],
        note: { vi: `Xét hàng xóm ${nei} của ${curr}.`, en: `Process neighbor ${nei} of ${curr}.` },
      });

      // Line 16: clone.neighbors.append(dfs(nei))
      push({
        title: { vi: `clone.neighbors.append(dfs(${nei}))`, en: `clone.neighbors.append(dfs(${nei}))` },
        hlNodes: [curr, nei],
        codeLines: [16],
        vars: [{ name: "calling", value: `dfs(${nei})` }],
        note: { vi: `Tạm dừng dfs(${curr}), đệ quy vào dfs(${nei}).`, en: `Pause dfs(${curr}), recurse into dfs(${nei}).` },
      });
      const neiCloneId = dfs(nei);
      cloneAdj[curr].push(neiCloneId);
      push({
        title: { vi: `clone.neighbors += [${nei}'] (từ dfs(${nei}))`, en: `clone.neighbors += [${nei}'] (from dfs(${nei}))` },
        hlNodes: [cloneId, neiCloneId],
        hlEdges: [[cloneId, neiCloneId]],
        codeLines: [16],
        vars: [{ name: `clone(${curr}).neighbors`, value: `[${cloneAdj[curr].map((c) => c - CLONE_OFFSET + "'").join(", ")}]` }],
        note: { vi: `dfs(${nei}) trả về clone ${nei}'. Thêm vào danh sách hàng xóm của clone ${curr}'.`, en: `dfs(${nei}) returned clone ${nei}'. Append it to clone ${curr}''s neighbor list.` },
      });
    }

    // Line 17: return clone
    push({
      title: { vi: `return clone (${curr}')`, en: `return clone (${curr}')` },
      hlNodes: [curr, cloneId],
      codeLines: [17],
      vars: [{ name: "returns", value: `${curr}'` }],
      note: { vi: `dfs(${curr}) hoàn tất, trả về clone ${curr}'.`, en: `dfs(${curr}) finishes, returning clone ${curr}'.` },
    });
    return cloneId;
  }

  // Line 18: return dfs(node)
  push({
    title: { vi: `return dfs(${start})`, en: `return dfs(${start})` },
    hlNodes: [start],
    codeLines: [18],
    vars: [{ name: "calling", value: `dfs(${start})` }],
    note: { vi: "Gọi DFS từ node xuất phát để clone toàn bộ đồ thị.", en: "Call DFS from the start node to clone the entire graph." },
  });
  dfs(start);

  // Build a serialized adjacency list of the CLONE graph (LeetCode-style output) to verify correctness.
  const cloneAdjList = [];
  for (let v = 1; v <= n; v++) {
    const nbrs = (cloneAdj[v] || []).map((cid) => cid - CLONE_OFFSET).sort((a, b) => a - b);
    cloneAdjList.push(nbrs);
  }
  const answerStr = `[${cloneAdjList.map((nbrs) => `[${nbrs.join(",")}]`).join(",")}]`;

  const fs = {
    title: { vi: `Kết quả: đồ thị clone = ${answerStr}`, en: `Result: cloned graph = ${answerStr}` },
    arr: [],
    graph: { nodes: currentNodes(), edges: currentEdges(), hlNodes: [], hlEdges: [], visitedNodes: visitedNodeIds() },
    highlight: [],
    mark: [],
    final: true,
    codeLines: [18],
    vars: [{ name: "answer", value: answerStr }],
    note: {
      vi: `Đã clone đủ ${n} node và toàn bộ cạnh. Danh sách kề của đồ thị clone: ${answerStr}.`,
      en: `Cloned all ${n} nodes and every edge. The clone graph's adjacency list: ${answerStr}.`,
    },
  };
  steps.push(fs);

  return { n, edges: edgeList, start, answer: answerStr, steps };
}

function buildSteps2492(input, params) {
  const n = params.n || 4;
  const edges = String(input || "")
    .split(";").map((s) => s.trim()).filter(Boolean)
    .map((s) => s.split(",").map(Number)); // [a, b, dist]

  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const steps = [];

  function find(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }

  function snapshot(opts) {
    const nodes = Array.from({ length: n }, (_, i) => {
      const city = i + 1;
      return { id: city, label: `${city}${find(city) !== city ? `→${find(city)}` : ""}` };
    });
    const edgeList = (opts.edges || []).map(([a, b, d]) => ({ u: a, v: b, w: d }));
    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes,
        edges: edgeList,
        hlNodes: opts.highlight || [],
        hlEdges: (opts.hlEdges || []).map(([a, b]) => [a, b]),
      },
      highlight: [], mark: [], codeLines: opts.codeLines || [],
      vars: opts.vars || [], note: opts.note,
    });
  }

  snapshot({
    title: { vi: "Khởi tạo Union-Find", en: "Initialize Union-Find" },
    codeLines: [3, 4],
    edges: [],
    vars: [
      { name: "n", value: n },
      { name: "edges", value: edges.length },
    ],
    note: {
      vi:
        `Ý tưởng: đường đi được lặp lại đỉnh/cạnh → mọi cạnh trong component chứa thành phố 1 ` +
        `đều có thể xuất hiện trên MỘT đường đi từ 1 đến n (đi tới, qua cạnh đó, rồi đi lui). ` +
        `Vậy đáp án = trọng số nhỏ nhất trong các cạnh có ít nhất 1 đầu nằm trong component của 1.\n` +
        `Bước 1: Union tất cả cạnh (bỏ qua trọng số) để tìm component.`,
      en:
        `Idea: since paths may revisit nodes/edges, EVERY edge inside city 1's connected ` +
        `component can appear on SOME path from 1 to n (walk there, cross it, walk back). ` +
        `So the answer = the minimum weight among edges with at least one endpoint in 1's component.\n` +
        `Step 1: Union all edges (ignoring weight) to discover the component.`,
    },
  });

  // Step 1: Union every edge, ignoring weight
  const processedEdges = [];
  for (const [a, b, d] of edges) {
    const ra = find(a);
    const rb = find(b);
    processedEdges.push([a, b, d]);
    if (ra !== rb) {
      parent[ra] = rb;
      snapshot({
        title: { vi: `Union(${a}, ${b})`, en: `Union(${a}, ${b})` },
        codeLines: [9, 10, 11],
        highlight: [a, b],
        edges: [...processedEdges],
        hlEdges: [[a, b]],
        vars: [
          { name: "edge", value: `(${a},${b}) dist=${d}` },
          { name: "find(a)", value: ra },
          { name: "find(b)", value: rb },
          { name: "merged", value: "yes" },
        ],
        note: {
          vi: `Nối ${a} và ${b} (bỏ qua dist=${d}, chỉ quan tâm kết nối). parent[${ra}] = ${rb}.`,
          en: `Connect ${a} and ${b} (ignore dist=${d}, only care about connectivity). parent[${ra}] = ${rb}.`,
        },
      });
    } else {
      snapshot({
        title: { vi: `(${a}, ${b}) đã cùng nhóm`, en: `(${a}, ${b}) same group` },
        codeLines: [9, 10],
        highlight: [a, b],
        edges: [...processedEdges],
        hlEdges: [[a, b]],
        vars: [
          { name: "edge", value: `(${a},${b}) dist=${d}` },
          { name: "find(a)", value: ra },
          { name: "find(b)", value: rb },
        ],
        note: {
          vi: `${a} và ${b} đã cùng root ${ra} → bỏ qua (chỉ nối, không tính min ở bước này).`,
          en: `${a} and ${b} already share root ${ra} → skip (union step doesn't track min yet).`,
        },
      });
    }
  }

  // Step 2: find root of city 1
  const root = find(1);
  snapshot({
    title: { vi: `Component của thành phố 1`, en: `City 1's component` },
    codeLines: [13],
    edges: processedEdges,
    highlight: [1],
    vars: [{ name: "root of city 1", value: root }],
    note: {
      vi: `Root của thành phố 1 = ${root}. Bây giờ quét lại các cạnh để tìm trọng số nhỏ nhất trong component này.`,
      en: `Root of city 1 = ${root}. Now re-scan edges to find the minimum weight within this component.`,
    },
  });

  // Step 3: re-scan edges for the min weight within root's component
  let answer = Infinity;
  for (const [a, b, d] of edges) {
    if (find(a) === root) {
      const updated = d < answer;
      if (updated) answer = d;
      snapshot({
        title: { vi: `Xét cạnh (${a},${b}) dist=${d}`, en: `Check edge (${a},${b}) dist=${d}` },
        codeLines: [15, 16, 17],
        edges: processedEdges,
        highlight: [a, b],
        hlEdges: [[a, b]],
        vars: [
          { name: "edge", value: `(${a},${b})` },
          { name: "dist", value: d },
          { name: "in component?", value: "yes" },
          { name: "answer", value: answer },
        ],
        note: {
          vi: `(${a},${b}) nằm trong component của thành phố 1. dist=${d}${updated ? ` < answer cũ → cập nhật answer=${d}` : ` ≥ answer=${answer}, giữ nguyên`}.`,
          en: `(${a},${b}) is inside city 1's component. dist=${d}${updated ? ` < previous answer → update answer=${d}` : ` ≥ answer=${answer}, unchanged`}.`,
        },
      });
    }
  }

  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [18],
    edges: processedEdges,
    highlight: [1, n],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Điểm nhỏ nhất của đường đi từ 1 đến ${n} = ${answer} (cạnh nhỏ nhất trong component chứa cả 1 và ${n}).`,
      en: `Minimum score of a path from 1 to ${n} = ${answer} (smallest edge weight in the component containing both 1 and ${n}).`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: input, answer, steps };
}

/**
 * LeetCode 2685: Count the Number of Complete Components.
 * A connected component with k nodes is COMPLETE iff it has k*(k-1)/2 edges,
 * i.e. sum of degrees inside the component == k*(k-1).
 * DFS each component, count nodes and total degree, then check completeness.
 */
function buildSteps2685(input, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps2685Recursive(input, params);
  return buildSteps2685Iterative(input, params);
}

function buildSteps2685Iterative(input, params) {
  const n = params && params.n !== undefined ? Number(params.n) : 6;
  const edgeList = String(input || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(",").map(Number))
    .filter((e) => e.length === 2 && !isNaN(e[0]) && !isNaN(e[1]));

  const steps = [];

  // Adjacency list
  const adj = Array.from({ length: n }, () => []);
  const allNodes = Array.from({ length: n }, (_, i) => i);
  const allEdges = [];

  function makeGraph(hlNodes, hlEdges, visitedNodes) {
    return {
      nodes: allNodes.map((id) => ({ id, label: String(id) })),
      edges: allEdges.slice(),
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: visitedNodes || [],
    };
  }

  function push({ title, hlNodes, hlEdges, visitedNodes, codeLines, vars, note, final }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(hlNodes, hlEdges, visitedNodes),
      highlight: [],
      mark: [],
      final: final || false,
      codeLines,
      vars,
      note,
    });
  }

  // ── Intro (line 2) ──
  push({
    title: { vi: "Ý tưởng: component đầy đủ", en: "Idea: complete component" },
    codeLines: [2],
    vars: [
      { name: "n", value: n },
      { name: "edges", value: edgeList.length },
    ],
    note: {
      vi:
        `Một component có k đỉnh là ĐẦY ĐỦ nếu mọi cặp đỉnh đều có cạnh → đúng k·(k-1)/2 cạnh.\n` +
        `Mẹo: tổng bậc các đỉnh trong component = 2·(số cạnh). Nên component đầy đủ khi tổng bậc == k·(k-1).\n` +
        `DFS từng component, đếm số đỉnh k và tổng bậc, rồi kiểm tra.`,
      en:
        `A component with k nodes is COMPLETE if every pair has an edge → exactly k·(k-1)/2 edges.\n` +
        `Trick: sum of degrees inside = 2·(edge count). So complete ⟺ total degree == k·(k-1).\n` +
        `DFS each component, count nodes k and total degree, then check.`,
    },
  });

  // ── Line 3: adj = [[] for _ in range(n)] ──
  push({
    title: { vi: "adj = [[] for _ in range(n)]", en: "adj = [[] for _ in range(n)]" },
    codeLines: [3],
    vars: [{ name: "adj", value: `${n} danh sách rỗng` }],
    note: { vi: `Tạo adjacency list rỗng cho ${n} đỉnh.`, en: `Create an empty adjacency list for ${n} nodes.` },
  });

  // ── Lines 4-6: build adjacency (per edge, line by line) ──
  for (const [a, b] of edgeList) {
    // Line 4: for a, b in edges
    push({
      title: { vi: `Cạnh (${a},${b})`, en: `Edge (${a},${b})` },
      hlNodes: [a, b],
      codeLines: [4],
      vars: [{ name: "a", value: a }, { name: "b", value: b }],
      note: { vi: `Xét cạnh (${a},${b}). Thêm vào adjacency list cả 2 chiều.`, en: `Process edge (${a},${b}). Add to adjacency list both ways.` },
    });

    // Line 5: adj[a].append(b)
    adj[a].push(b);
    push({
      title: { vi: `adj[${a}].append(${b})`, en: `adj[${a}].append(${b})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [5],
      vars: [{ name: `adj[${a}]`, value: `[${adj[a].join(", ")}]` }],
      note: { vi: `Thêm ${b} vào danh sách kề của ${a}.`, en: `Add ${b} to ${a}'s neighbor list.` },
    });

    // Line 6: adj[b].append(a)
    adj[b].push(a);
    allEdges.push({ u: a, v: b, w: "" });
    push({
      title: { vi: `adj[${b}].append(${a})`, en: `adj[${b}].append(${a})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [6],
      vars: [{ name: `adj[${b}]`, value: `[${adj[b].join(", ")}]` }],
      note: { vi: `Thêm ${a} vào danh sách kề của ${b}. Cạnh (${a},${b}) đã xong.`, en: `Add ${a} to ${b}'s neighbor list. Edge (${a},${b}) done.` },
    });
  }

  const visited = new Array(n).fill(false);
  let count = 0;

  // ── Line 7: visited = [False]*n ──
  push({
    title: { vi: "visited = [False] * n", en: "visited = [False] * n" },
    codeLines: [7],
    vars: [{ name: "visited", value: `[${visited.map(() => "F").join(",")}]` }],
    note: { vi: `Mảng đánh dấu đỉnh đã thăm, ban đầu tất cả False.`, en: `Visited flags, all False initially.` },
  });

  // ── Line 8: count = 0 ──
  push({
    title: { vi: "count = 0", en: "count = 0" },
    codeLines: [8],
    vars: [{ name: "count", value: 0 }],
    note: { vi: `Biến đếm số component đầy đủ.`, en: `Counter for complete components.` },
  });

  // ── Line 9-24: main loop ──
  for (let i = 0; i < n; i++) {
    // Line 9: for i in range(n)
    push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      hlNodes: [i],
      visitedNodes: allNodes.filter((x) => visited[x]),
      codeLines: [9],
      vars: [{ name: "i", value: i }, { name: "visited[i]", value: visited[i] }],
      note: { vi: `Xét đỉnh ${i}.`, en: `Consider node ${i}.` },
    });

    // Line 10: if not visited[i]
    if (visited[i]) {
      push({
        title: { vi: `visited[${i}] = True → bỏ qua`, en: `visited[${i}] = True → skip` },
        hlNodes: [i],
        visitedNodes: allNodes.filter((x) => visited[x]),
        codeLines: [10],
        vars: [{ name: "visited[i]", value: true }],
        note: { vi: `Đỉnh ${i} đã thuộc một component xử lý trước → bỏ qua.`, en: `Node ${i} already belongs to a processed component → skip.` },
      });
      continue;
    }

    push({
      title: { vi: `visited[${i}] = False → component mới`, en: `visited[${i}] = False → new component` },
      hlNodes: [i],
      visitedNodes: allNodes.filter((x) => visited[x]),
      codeLines: [10],
      vars: [{ name: "visited[i]", value: false }],
      note: { vi: `Đỉnh ${i} chưa thăm → bắt đầu DFS một component mới.`, en: `Node ${i} unvisited → start DFS for a new component.` },
    });

    // Line 11: nodes, total_deg = [], 0
    const compNodes = [];
    let totalDeg = 0;
    push({
      title: { vi: "nodes, total_deg = [], 0", en: "nodes, total_deg = [], 0" },
      hlNodes: [i],
      visitedNodes: allNodes.filter((x) => visited[x]),
      codeLines: [11],
      vars: [{ name: "nodes", value: "[]" }, { name: "total_deg", value: 0 }],
      note: { vi: `Khởi tạo danh sách đỉnh và tổng bậc cho component này.`, en: `Init node list and total degree for this component.` },
    });

    // Line 12: stack = [i]
    const stack = [i];
    push({
      title: { vi: `stack = [${i}]`, en: `stack = [${i}]` },
      hlNodes: [i],
      visitedNodes: allNodes.filter((x) => visited[x]),
      codeLines: [12],
      vars: [{ name: "stack", value: `[${i}]` }],
      note: { vi: `Đưa đỉnh gốc ${i} vào stack DFS.`, en: `Push start node ${i} onto the DFS stack.` },
    });

    // Line 13: visited[i] = True
    visited[i] = true;
    push({
      title: { vi: `visited[${i}] = True`, en: `visited[${i}] = True` },
      hlNodes: [i],
      visitedNodes: allNodes.filter((x) => visited[x]),
      codeLines: [13],
      vars: [{ name: "visited[i]", value: true }],
      note: { vi: `Đánh dấu đỉnh gốc ${i} đã thăm.`, en: `Mark start node ${i} visited.` },
    });

    // DFS: while stack
    while (stack.length) {
      // Line 15: cur = stack.pop()
      const cur = stack.pop();
      push({
        title: { vi: `cur = stack.pop() = ${cur}`, en: `cur = stack.pop() = ${cur}` },
        hlNodes: [cur],
        visitedNodes: allNodes.filter((x) => visited[x]),
        codeLines: [15],
        vars: [{ name: "cur", value: cur }, { name: "stack", value: `[${stack.join(", ")}]` }],
        note: { vi: `Lấy đỉnh ${cur} ra khỏi stack để xử lý.`, en: `Pop node ${cur} from the stack to process.` },
      });

      // Line 16: nodes.append(cur)
      compNodes.push(cur);
      push({
        title: { vi: `nodes.append(${cur})`, en: `nodes.append(${cur})` },
        hlNodes: compNodes.slice(),
        visitedNodes: allNodes.filter((x) => visited[x]),
        codeLines: [16],
        vars: [{ name: "nodes", value: `[${compNodes.join(", ")}]` }],
        note: { vi: `Thêm ${cur} vào component hiện tại.`, en: `Add ${cur} to the current component.` },
      });

      // Line 17: total_deg += len(adj[cur])
      const deg = adj[cur].length;
      totalDeg += deg;
      push({
        title: { vi: `total_deg += len(adj[${cur}]) = +${deg} → ${totalDeg}`, en: `total_deg += len(adj[${cur}]) = +${deg} → ${totalDeg}` },
        hlNodes: [cur],
        hlEdges: adj[cur].map((nb) => [cur, nb]),
        visitedNodes: allNodes.filter((x) => visited[x]),
        codeLines: [17],
        vars: [
          { name: `bậc(${cur})`, value: deg },
          { name: "total_deg", value: totalDeg },
        ],
        note: { vi: `Đỉnh ${cur} có bậc ${deg} (${adj[cur].length ? "kề " + adj[cur].join(",") : "không kề ai"}). Cộng vào total_deg = ${totalDeg}.`, en: `Node ${cur} has degree ${deg}. Add to total_deg = ${totalDeg}.` },
      });

      // Line 18-21: scan neighbors
      const pushed = [];
      for (const nb of adj[cur]) {
        if (!visited[nb]) {
          visited[nb] = true;
          stack.push(nb);
          pushed.push(nb);
        }
      }
      push({
        title: { vi: `Duyệt hàng xóm của ${cur}`, en: `Scan neighbors of ${cur}` },
        hlNodes: [cur, ...pushed],
        hlEdges: adj[cur].map((nb) => [cur, nb]),
        visitedNodes: allNodes.filter((x) => visited[x]),
        codeLines: [18, 19, 20, 21],
        vars: [
          { name: "neighbors", value: `[${adj[cur].join(", ")}]` },
          { name: "mới thăm & push", value: pushed.length ? `[${pushed.join(", ")}]` : "(không có)" },
          { name: "stack", value: `[${stack.join(", ")}]` },
        ],
        note: {
          vi: `Với mỗi hàng xóm chưa thăm của ${cur}: đánh dấu visited và push vào stack. ${pushed.length ? "Đã push: " + pushed.join(", ") : "Không có hàng xóm mới."}`,
          en: `For each unvisited neighbor of ${cur}: mark visited and push. ${pushed.length ? "Pushed: " + pushed.join(", ") : "No new neighbors."}`,
        },
      });
    }

    // Line 22: k = len(nodes)
    const k = compNodes.length;
    push({
      title: { vi: `k = len(nodes) = ${k}`, en: `k = len(nodes) = ${k}` },
      hlNodes: compNodes.slice(),
      visitedNodes: allNodes.filter((x) => visited[x]),
      codeLines: [22],
      vars: [
        { name: "component", value: `[${compNodes.join(", ")}]` },
        { name: "k (số đỉnh)", value: k },
        { name: "total_deg", value: totalDeg },
      ],
      note: { vi: `Component gồm ${k} đỉnh: [${compNodes.join(", ")}]. Tổng bậc = ${totalDeg}.`, en: `Component has ${k} nodes: [${compNodes.join(", ")}]. Total degree = ${totalDeg}.` },
    });

    // Line 23: if total_deg == k*(k-1)
    const need = k * (k - 1);
    const complete = totalDeg === need;
    push({
      title: { vi: `total_deg == k·(k-1)? ${totalDeg} == ${need}? ${complete ? "✓" : "✗"}`, en: `total_deg == k·(k-1)? ${totalDeg} == ${need}? ${complete ? "✓" : "✗"}` },
      hlNodes: compNodes.slice(),
      hlEdges: allEdges.filter((e) => compNodes.includes(e.u) && compNodes.includes(e.v)).map((e) => [e.u, e.v]),
      visitedNodes: allNodes.filter((x) => visited[x]),
      codeLines: [23],
      vars: [
        { name: "total_deg", value: totalDeg },
        { name: "k·(k-1)", value: `${k}·${k - 1} = ${need}` },
        { name: "đầy đủ?", value: complete },
      ],
      note: {
        vi: complete
          ? `${totalDeg} == ${need} → ĐẦY ĐỦ! Component này có đủ ${need / 2} cạnh (mọi cặp đều nối).`
          : `${totalDeg} ≠ ${need} → KHÔNG đầy đủ. Có ${totalDeg / 2} cạnh, cần ${need / 2}.`,
        en: complete
          ? `${totalDeg} == ${need} → COMPLETE! It has all ${need / 2} edges (every pair connected).`
          : `${totalDeg} ≠ ${need} → NOT complete. Has ${totalDeg / 2} edges, needs ${need / 2}.`,
      },
    });

    // Line 24: count += 1 (if complete)
    if (complete) {
      count++;
      push({
        title: { vi: `count += 1 → ${count}`, en: `count += 1 → ${count}` },
        hlNodes: compNodes.slice(),
        visitedNodes: allNodes.filter((x) => visited[x]),
        codeLines: [24],
        vars: [{ name: "count", value: count }],
        note: { vi: `Component đầy đủ → tăng count = ${count}.`, en: `Complete component → increment count = ${count}.` },
      });
    }
  }

  // ── Line 25: return count ──
  push({
    title: { vi: `Kết quả: ${count} component đầy đủ`, en: `Result: ${count} complete components` },
    hlNodes: [],
    visitedNodes: allNodes,
    codeLines: [25],
    vars: [{ name: "answer", value: count }],
    final: true,
    note: { vi: `Có ${count} component đầy đủ trong đồ thị.`, en: `There are ${count} complete components in the graph.` },
  });

  return { n, edges: edgeList, answer: count, steps };
}

/**
 * LeetCode 2685, approach 2: recursive DFS.
 * Each DFS call returns the component's node count and degree sum.
 */
function buildSteps2685Recursive(input, params) {
  const n = params && params.n !== undefined ? Number(params.n) : 6;
  const edgeList = String(input || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(",").map(Number))
    .filter((edge) => edge.length === 2 && !edge.some(Number.isNaN));
  const steps = [];
  const adj = Array.from({ length: n }, () => []);
  const allNodes = Array.from({ length: n }, (_, id) => id);
  const allEdges = [];

  function visitedNodes(visited) {
    return allNodes.filter((id) => visited[id]);
  }

  function makeGraph(hlNodes = [], hlEdges = [], visited = []) {
    return {
      nodes: allNodes.map((id) => ({ id, label: String(id) })),
      edges: allEdges.slice(),
      hlNodes,
      hlEdges,
      visitedNodes: visited,
    };
  }

  function push({ title, hlNodes, hlEdges, visited, codeLines, vars, note, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(hlNodes, hlEdges, visited),
      highlight: [],
      mark: [],
      final,
      codeBlock: 2,
      codeLines,
      vars,
      note,
    });
  }

  push({
    title: { vi: "Ý tưởng: DFS đệ quy trả về (số đỉnh, tổng bậc)", en: "Idea: recursive DFS returns (node count, degree sum)" },
    codeLines: [2],
    vars: [{ name: "n", value: n }, { name: "edges", value: edgeList.length }],
    note: {
      vi: "Mỗi lời gọi dfs(node) xử lý một nhánh chưa thăm và trả về số đỉnh cùng tổng bậc của nhánh đó.",
      en: "Each dfs(node) call processes an unvisited branch and returns its node count and degree sum.",
    },
  });

  push({
    title: { vi: "graph = [[] for _ in range(n)]", en: "graph = [[] for _ in range(n)]" },
    codeLines: [3],
    vars: [{ name: "graph", value: `${n} danh sách rỗng` }],
    note: { vi: `Tạo adjacency list rỗng cho ${n} đỉnh.`, en: `Create an empty adjacency list for ${n} nodes.` },
  });

  for (const [a, b] of edgeList) {
    push({
      title: { vi: `Vòng lặp: a, b = ${a}, ${b}`, en: `Loop: a, b = ${a}, ${b}` },
      hlNodes: [a, b],
      codeLines: [4],
      vars: [{ name: "a", value: a }, { name: "b", value: b }],
      note: { vi: `Xét cạnh vô hướng (${a}, ${b}).`, en: `Process undirected edge (${a}, ${b}).` },
    });
    adj[a].push(b);
    push({
      title: { vi: `graph[${a}].append(${b})`, en: `graph[${a}].append(${b})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [5],
      vars: [{ name: `graph[${a}]`, value: `[${adj[a].join(", ")}]` }],
      note: { vi: `Thêm ${b} vào danh sách kề của ${a}.`, en: `Add ${b} to ${a}'s adjacency list.` },
    });
    adj[b].push(a);
    allEdges.push({ u: a, v: b, w: "" });
    push({
      title: { vi: `graph[${b}].append(${a})`, en: `graph[${b}].append(${a})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [6],
      vars: [{ name: `graph[${b}]`, value: `[${adj[b].join(", ")}]` }],
      note: { vi: `Thêm ${a} vào danh sách kề của ${b}.`, en: `Add ${a} to ${b}'s adjacency list.` },
    });
  }

  const visited = new Array(n).fill(false);
  let ans = 0;
  push({
    title: { vi: "visited = [False] * n", en: "visited = [False] * n" },
    codeLines: [7],
    vars: [{ name: "visited", value: `[${visited.map(() => "F").join(", ")}]` }],
    note: { vi: "Ban đầu chưa thăm đỉnh nào.", en: "Initially, no node has been visited." },
  });
  push({
    title: { vi: "ans = 0", en: "ans = 0" },
    codeLines: [8],
    vars: [{ name: "ans", value: ans }],
    note: { vi: "ans đếm số complete components.", en: "ans counts complete components." },
  });
  push({
    title: { vi: "Định nghĩa dfs(node)", en: "Define dfs(node)" },
    codeLines: [9],
    vars: [{ name: "dfs", value: "returns (nodes, degree_sum)" }],
    note: { vi: "Hàm DFS sẽ trả về số đỉnh và tổng bậc của phần đồ thị nó duyệt.", en: "The DFS function returns the node count and degree sum of its traversal." },
  });

  function dfs(node, depth) {
    visited[node] = true;
    push({
      title: { vi: `dfs(${node}): visited[${node}] = True`, en: `dfs(${node}): visited[${node}] = True` },
      hlNodes: [node],
      visited: visitedNodes(visited),
      codeLines: [10],
      vars: [{ name: "node", value: node }, { name: "depth", value: depth }],
      note: { vi: `Đánh dấu ${node} đã thăm để không DFS lại qua cạnh ngược.`, en: `Mark ${node} visited so reverse edges do not recurse again.` },
    });

    let nodes = 1;
    push({
      title: { vi: `dfs(${node}): nodes = 1`, en: `dfs(${node}): nodes = 1` },
      hlNodes: [node],
      visited: visitedNodes(visited),
      codeLines: [11],
      vars: [{ name: "nodes", value: nodes }, { name: "node", value: node }],
      note: { vi: `Lời gọi dfs(${node}) tự chứa đỉnh ${node}, nên bắt đầu với 1 đỉnh.`, en: `The dfs(${node}) call contains node ${node}, so start with one node.` },
    });

    let degreeSum = adj[node].length;
    push({
      title: { vi: `degree_sum = len(graph[${node}]) = ${degreeSum}`, en: `degree_sum = len(graph[${node}]) = ${degreeSum}` },
      hlNodes: [node],
      hlEdges: adj[node].map((neighbor) => [node, neighbor]),
      visited: visitedNodes(visited),
      codeLines: [12],
      vars: [{ name: "degree_sum", value: degreeSum }, { name: `degree(${node})`, value: adj[node].length }],
      note: { vi: `Cộng toàn bộ bậc của ${node}: có ${adj[node].length} hàng xóm.`, en: `Start with node ${node}'s full degree: ${adj[node].length} neighbors.` },
    });

    for (const neighbor of adj[node]) {
      push({
        title: { vi: `for nei in graph[${node}]: nei = ${neighbor}`, en: `for nei in graph[${node}]: nei = ${neighbor}` },
        hlNodes: [node, neighbor],
        hlEdges: [[node, neighbor]],
        visited: visitedNodes(visited),
        codeLines: [13],
        vars: [{ name: "node", value: node }, { name: "nei", value: neighbor }],
        note: { vi: `Duyệt hàng xóm ${neighbor} của ${node}.`, en: `Inspect neighbor ${neighbor} of ${node}.` },
      });

      if (visited[neighbor]) {
        push({
          title: { vi: `visited[${neighbor}] = True → không DFS lại`, en: `visited[${neighbor}] = True → do not recurse` },
          hlNodes: [node, neighbor],
          hlEdges: [[node, neighbor]],
          visited: visitedNodes(visited),
          codeLines: [14],
          vars: [{ name: "visited[nei]", value: true }],
          note: { vi: `${neighbor} đã được tính trong lời gọi DFS trước đó, nên bỏ qua để tránh vòng lặp.`, en: `${neighbor} was counted by an earlier DFS call, so skip it to avoid a cycle.` },
        });
        continue;
      }

      push({
        title: { vi: `visited[${neighbor}] = False → DFS vào ${neighbor}`, en: `visited[${neighbor}] = False → recurse into ${neighbor}` },
        hlNodes: [node, neighbor],
        hlEdges: [[node, neighbor]],
        visited: visitedNodes(visited),
        codeLines: [14],
        vars: [{ name: "visited[nei]", value: false }],
        note: { vi: `${neighbor} chưa thăm, nên sẽ gọi DFS đệ quy.`, en: `${neighbor} is unvisited, so recurse into it.` },
      });
      push({
        title: { vi: `x, y = dfs(${neighbor})`, en: `x, y = dfs(${neighbor})` },
        hlNodes: [neighbor],
        hlEdges: [[node, neighbor]],
        visited: visitedNodes(visited),
        codeLines: [15],
        vars: [{ name: "x, y", value: "đợi dfs trả về" }, { name: "depth", value: depth + 1 }],
        note: { vi: `Tạm dừng dfs(${node}) và đi sâu vào dfs(${neighbor}).`, en: `Pause dfs(${node}) and descend into dfs(${neighbor}).` },
      });
      const child = dfs(neighbor, depth + 1);
      nodes += child.nodes;
      push({
        title: { vi: `nodes += x → ${nodes}`, en: `nodes += x → ${nodes}` },
        hlNodes: [node],
        visited: visitedNodes(visited),
        codeLines: [16],
        vars: [{ name: "x", value: child.nodes }, { name: "nodes", value: nodes }],
        note: { vi: `dfs(${neighbor}) trả x = ${child.nodes} đỉnh; cộng vào lời gọi dfs(${node}).`, en: `dfs(${neighbor}) returned x = ${child.nodes} nodes; add them into dfs(${node}).` },
      });
      degreeSum += child.degreeSum;
      push({
        title: { vi: `degree_sum += y → ${degreeSum}`, en: `degree_sum += y → ${degreeSum}` },
        hlNodes: [node],
        visited: visitedNodes(visited),
        codeLines: [17],
        vars: [{ name: "y", value: child.degreeSum }, { name: "degree_sum", value: degreeSum }],
        note: { vi: `dfs(${neighbor}) trả y = ${child.degreeSum}; cộng tổng bậc của nhánh con.`, en: `dfs(${neighbor}) returned y = ${child.degreeSum}; add its degree sum.` },
      });
    }

    push({
      title: { vi: `return (${nodes}, ${degreeSum})`, en: `return (${nodes}, ${degreeSum})` },
      hlNodes: [node],
      visited: visitedNodes(visited),
      codeLines: [18],
      vars: [{ name: "nodes", value: nodes }, { name: "degree_sum", value: degreeSum }],
      note: { vi: `dfs(${node}) hoàn tất và trả về hai giá trị cho lời gọi cha.`, en: `dfs(${node}) finishes and returns both values to its caller.` },
    });
    return { nodes, degreeSum };
  }

  for (let i = 0; i < n; i++) {
    push({
      title: { vi: `for i in range(n): i = ${i}`, en: `for i in range(n): i = ${i}` },
      hlNodes: [i],
      visited: visitedNodes(visited),
      codeLines: [19],
      vars: [{ name: "i", value: i }, { name: "visited[i]", value: visited[i] }],
      note: { vi: `Xét đỉnh ${i} để xem nó có mở đầu một component mới không.`, en: `Check whether node ${i} starts a new component.` },
    });
    if (visited[i]) {
      push({
        title: { vi: `visited[${i}] = True → bỏ qua`, en: `visited[${i}] = True → skip` },
        hlNodes: [i],
        visited: visitedNodes(visited),
        codeLines: [20],
        vars: [{ name: "visited[i]", value: true }],
        note: { vi: `${i} đã thuộc component đã xử lý.`, en: `${i} already belongs to a processed component.` },
      });
      continue;
    }

    push({
      title: { vi: `visited[${i}] = False → component mới`, en: `visited[${i}] = False → new component` },
      hlNodes: [i],
      visited: visitedNodes(visited),
      codeLines: [20],
      vars: [{ name: "visited[i]", value: false }],
      note: { vi: `Bắt đầu DFS đệ quy từ ${i}.`, en: `Start recursive DFS from ${i}.` },
    });
    push({
      title: { vi: `nodes, degree_sum = dfs(${i})`, en: `nodes, degree_sum = dfs(${i})` },
      hlNodes: [i],
      visited: visitedNodes(visited),
      codeLines: [21],
      vars: [{ name: "dfs root", value: i }],
      note: { vi: `Gọi DFS. Các bước tiếp theo đi vào thân hàm dfs rồi mới quay lại dòng này.`, en: `Call DFS. The next steps enter dfs before returning to this assignment.` },
    });
    const component = dfs(i, 0);
    const edgeCount = component.degreeSum / 2;
    push({
      title: { vi: `edge_count = ${component.degreeSum} // 2 = ${edgeCount}`, en: `edge_count = ${component.degreeSum} // 2 = ${edgeCount}` },
      hlNodes: allNodes.filter((id) => visited[id]),
      visited: visitedNodes(visited),
      codeLines: [22],
      vars: [{ name: "degree_sum", value: component.degreeSum }, { name: "edge_count", value: edgeCount }],
      note: { vi: `Mỗi cạnh bị tính hai lần trong degree_sum, một lần ở mỗi đầu mút.`, en: `Each edge appears twice in degree_sum, once from each endpoint.` },
    });
    const requiredEdges = component.nodes * (component.nodes - 1) / 2;
    const complete = edgeCount === requiredEdges;
    push({
      title: { vi: `${edgeCount} == ${component.nodes}·(${component.nodes}-1)//2? ${complete ? "✓" : "✗"}`, en: `${edgeCount} == ${component.nodes}·(${component.nodes}-1)//2? ${complete ? "✓" : "✗"}` },
      hlNodes: allNodes.filter((id) => visited[id]),
      visited: visitedNodes(visited),
      codeLines: [23],
      vars: [{ name: "nodes", value: component.nodes }, { name: "edge_count", value: edgeCount }, { name: "cần có", value: requiredEdges }],
      note: complete
        ? { vi: `Component có đủ ${requiredEdges} cạnh cho ${component.nodes} đỉnh → complete.`, en: `The component has all ${requiredEdges} required edges for ${component.nodes} nodes → complete.` }
        : { vi: `Component chỉ có ${edgeCount} cạnh, cần ${requiredEdges} → không complete.`, en: `The component has ${edgeCount} edges but needs ${requiredEdges} → not complete.` },
    });
    if (complete) {
      ans++;
      push({
        title: { vi: `ans += 1 → ${ans}`, en: `ans += 1 → ${ans}` },
        visited: visitedNodes(visited),
        codeLines: [24],
        vars: [{ name: "ans", value: ans }],
        note: { vi: "Tăng đáp án vì component này đầy đủ.", en: "Increment the answer because this component is complete." },
      });
    }
  }

  push({
    title: { vi: `return ${ans}`, en: `return ${ans}` },
    visited: visitedNodes(visited),
    codeLines: [25],
    vars: [{ name: "answer", value: ans }],
    final: true,
    note: { vi: `Có ${ans} complete component(s).`, en: `There are ${ans} complete component(s).` },
  });
  return { n, edges: edgeList, answer: ans, steps };
}

/**
 * LeetCode 694: Number of Distinct Islands.
 * DFS each island; record its shape as relative coordinates from the start.
 * Two islands are the same if their (translated) shapes match → use a set.
 */
function buildStepsDistinctIslands(input) {
  const grid = parseIslandGrid(input);
  const steps = [];

  if (!grid.length || !grid[0].length || grid.some((row) => row.length !== grid[0].length || row.some((v) => v !== "0" && v !== "1"))) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [3],
      vars: [{ name: "error", value: "invalid" }],
      note: {
        vi: "Grid phải gồm 0/1. Ví dụ: 11000|11000|00011|00011.",
        en: "Grid must contain 0/1. Example: 11000|11000|00011|00011.",
      },
    });
    return { original: grid, answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const visitedCells = Array.from({ length: rows }, () => Array(cols).fill(false));
  const shapeIdOf = Array.from({ length: rows }, () => Array(cols).fill(0)); // distinct shape id, 0 = none
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (r, c) => `${r},${c}`;
  const visited = new Set();
  const signatureRecords = [];
  let islandCount = 0;
  let distinctCount = 0;

  function makeCells(current, buildingCells, origin) {
    const bset = buildingCells ? new Set(buildingCells.map(([r, c]) => key(r, c))) : null;
    return grid.map((row, r) =>
      row.map((v, c) => {
        let cls, label;
        if (v === "0") { cls = "wall"; label = "0"; }
        else if (shapeIdOf[r][c] > 0) { cls = "visited"; label = `S${shapeIdOf[r][c]}`; }
        else { cls = "empty"; label = "1"; }
        if (bset && bset.has(key(r, c))) {
          cls = "queued";
          if (origin) label = `${r - origin[0]},${c - origin[1]}`;
        }
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls, meta: `(${r},${c})` };
      })
    );
  }

  function pushStep({
    title,
    current = null,
    buildingCells = null,
    origin = null,
    shape = [],
    stack = [],
    phase = "scan",
    event = "scan",
    signature = "",
    candidateState = "",
    matchId = null,
    final = false,
    codeLines,
    vars,
    note,
  }) {
    const shapeCells = shape.map(([dr, dc]) => ({
      row: origin ? origin[0] + dr : dr,
      col: origin ? origin[1] + dc : dc,
      dr,
      dc,
    }));
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, variant: "distinct-islands", cells: makeCells(current, buildingCells, origin) },
      distinctIslandView: {
        phase,
        event,
        islandNumber: islandCount,
        distinctCount,
        current: current ? [...current] : null,
        origin: origin ? [...origin] : null,
        shape: shapeCells,
        stack: stack.map(([r, c]) => ({ row: r, col: c, dr: origin ? r - origin[0] : r, dc: origin ? c - origin[1] : c })),
        signature,
        candidateState,
        matchId,
        knownSignatures: signatureRecords.map((record) => ({
          id: record.id,
          signature: record.signature,
          shape: record.shape.map(([dr, dc]) => ({ dr, dc })),
        })),
        visitedSize: visited.size,
      },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  // Intro (line 2)
  pushStep({
    title: { vi: "Ý tưởng: ghi chữ ký hình dạng đảo", en: "Idea: record each island's shape signature" },
    codeLines: [2],
    vars: [
      { name: "rows", value: rows },
      { name: "cols", value: cols },
    ],
    note: {
      vi:
        `Đếm số ĐẢO KHÁC HÌNH. Hai đảo giống nhau nếu dịch tịnh tiến (không xoay/lật) thì trùng.\n` +
        `Với mỗi đảo, DFS ghi lại tọa độ các ô TƯƠNG ĐỐI so với ô gốc → 'chữ ký'.\n` +
        `Bỏ chữ ký vào set. Đáp án = số chữ ký khác nhau.\n\n` +
        `Lưu ý: dfs() định nghĩa ở dòng 5-13 nhưng được GỌI ở dòng 18, nên con trỏ sẽ nhảy lên/xuống — đó là cách đệ quy chạy.`,
      en:
        `Count DISTINCT island shapes. Two islands are the same if a translation (no rotation/reflection) matches them.\n` +
        `For each island, DFS records cell coordinates RELATIVE to the start → a 'signature'.\n` +
        `Add signature to a set. Answer = number of distinct signatures.\n\n` +
        `Note: dfs() is defined at lines 5-13 but CALLED at line 18, so the pointer jumps up/down — that's how recursion runs.`,
    },
  });

  // Line 3: m, n = len(grid), len(grid[0])
  pushStep({
    title: { vi: "m, n = len(grid), len(grid[0])", en: "m, n = len(grid), len(grid[0])" },
    codeLines: [3],
    vars: [{ name: "m", value: rows }, { name: "n", value: cols }],
    note: { vi: `Kích thước lưới: m=${rows} hàng, n=${cols} cột.`, en: `Grid size: m=${rows} rows, n=${cols} cols.` },
  });

  // Line 4: visited = set()
  pushStep({
    title: { vi: "visited = set() (tập chữ ký)", en: "visited = set() (signature set)" },
    codeLines: [4],
    vars: [{ name: "visited", value: "{}" }],
    note: { vi: `Tạo set rỗng để lưu các chữ ký hình dạng khác nhau.`, en: `Create an empty set to store distinct shape signatures.` },
  });

  // Line 14: for i in range(m) — start scanning
  pushStep({
    title: { vi: "Bắt đầu quét lưới (for i, for j)", en: "Start scanning grid (for i, for j)" },
    codeLines: [14],
    vars: [{ name: "scan", value: "0..m-1, 0..n-1" }],
    note: { vi: `Duyệt từng ô. Gặp đất '1' chưa thăm thì bắt đầu một đảo mới.`, en: `Scan every cell. Unvisited land '1' starts a new island.` },
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1" || visitedCells[r][c]) continue;

      islandCount++;
      const r0 = r, c0 = c;

      // Step: found new land (line 16)
      pushStep({
        title: { vi: `Tìm thấy đất mới tại (${r},${c})`, en: `New land found at (${r},${c})` },
        current: [r, c],
        origin: [r0, c0],
        phase: "scan",
        event: "found",
        codeLines: [16],
        vars: [
          { name: "start", value: `(${r}, ${c})` },
          { name: "island #", value: islandCount },
        ],
        note: {
          vi: `Ô (${r},${c}) = '1' chưa thăm → bắt đầu đảo mới. Ô này là GỐC (0,0) của chữ ký.`,
          en: `Cell (${r},${c}) = '1' unvisited → start a new island. This is the ORIGIN (0,0) of the signature.`,
        },
      });

      // Step: shape = [] (line 17)
      const shape = [];
      pushStep({
        title: { vi: "shape = [] (khởi tạo chữ ký)", en: "shape = [] (init signature)" },
        current: [r, c],
        origin: [r0, c0],
        phase: "dfs",
        event: "init-shape",
        codeLines: [17],
        vars: [{ name: "shape", value: "[]" }],
        note: {
          vi: `Tạo danh sách rỗng để ghi tọa độ tương đối của các ô trong đảo.`,
          en: `Create an empty list to record relative coordinates of the island's cells.`,
        },
      });

      // Step: dfs call (line 18)
      pushStep({
        title: { vi: `Gọi dfs(${r},${c})`, en: `Call dfs(${r},${c})` },
        current: [r, c],
        origin: [r0, c0],
        stack: [[r, c]],
        phase: "dfs",
        event: "start-dfs",
        codeLines: [18],
        vars: [{ name: "origin", value: `(${r0}, ${c0})` }],
        note: {
          vi: `Bắt đầu DFS để lan khắp đảo và ghi hình dạng.`,
          en: `Start DFS to spread across the island and record its shape.`,
        },
      });

      // DFS traversal — one step per cell (line-by-line)
      const stack = [[r, c]];
      visitedCells[r][c] = true;
      const buildingCells = [];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        const rel = [cr - r0, cc - c0];
        shape.push(rel);
        buildingCells.push([cr, cc]);

        // collect valid neighbors and mark visited (so we don't requeue)
        const queuedNb = [];
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (grid[nr][nc] !== "1" || visitedCells[nr][nc]) continue;
          visitedCells[nr][nc] = true;
          queuedNb.push([nr, nc]);
        }
        const frontier = stack.concat(queuedNb);

        // Step: grid[r][c] = 0 — mark visited (line 8)
        pushStep({
          title: { vi: `dfs(${cr},${cc}): grid[${cr}][${cc}] = 0 (đánh dấu)`, en: `dfs(${cr},${cc}): grid[${cr}][${cc}] = 0 (mark visited)` },
          current: [cr, cc],
          buildingCells: buildingCells.slice(),
          origin: [r0, c0],
          shape: shape.slice(),
          stack: frontier,
          phase: "dfs",
          event: "mark-cell",
          codeLines: [8],
          vars: [
            { name: "cell", value: `(${cr}, ${cc})` },
            { name: "grid[r][c]", value: "0 (đã thăm)" },
          ],
          note: {
            vi: `Ô (${cr},${cc}) là đất → đánh dấu đã thăm bằng cách gán grid = 0 (tránh lặp).`,
            en: `Cell (${cr},${cc}) is land → mark visited by setting grid = 0 (avoid revisiting).`,
          },
        });

        // Step: shape.append((r-r0, c-c0)) — record relative coord (line 9)
        pushStep({
          title: { vi: `shape.append((${rel[0]},${rel[1]}))`, en: `shape.append((${rel[0]},${rel[1]}))` },
          current: [cr, cc],
          buildingCells: buildingCells.slice(),
          origin: [r0, c0],
          shape: shape.slice(),
          stack: frontier,
          phase: "dfs",
          event: "append-relative",
          codeLines: [9],
          vars: [
            { name: "relative", value: `(${cr}-${r0}, ${cc}-${c0}) = (${rel[0]}, ${rel[1]})` },
            { name: "shape", value: `[${shape.map(([a, b]) => `(${a},${b})`).join(", ")}]` },
          ],
          note: {
            vi: `Ghi tọa độ TƯƠNG ĐỐI so với gốc (${r0},${c0}): (${rel[0]},${rel[1]}). Đây là 1 phần của chữ ký.`,
            en: `Record coord RELATIVE to origin (${r0},${c0}): (${rel[0]},${rel[1]}). Part of the signature.`,
          },
        });

        for (const nb of queuedNb) stack.push(nb);
      }

      // Canonical signature: sort relative coords so traversal order doesn't matter
      const canonicalShape = shape.slice().sort(([ar, ac], [br, bc]) => ar - br || ac - bc);
      const sig = canonicalShape.map(([a, b]) => `${a},${b}`).join("|");
      const existingRecord = signatureRecords.find((record) => record.signature === sig) || null;
      const isNew = !visited.has(sig);
      if (isNew) {
        visited.add(sig);
        distinctCount++;
        signatureRecords.push({ id: distinctCount, signature: sig, shape: canonicalShape });
      }
      const thisShapeId = isNew ? distinctCount : existingRecord.id;
      // Assign shape id for coloring the finished island cells
      for (const [cr, cc] of buildingCells) shapeIdOf[cr][cc] = thisShapeId;

      // Step: visited.add(tuple(sorted(shape))) (line 19)
      pushStep({
        title: {
          vi: isNew ? `Chữ ký MỚI → distinct = ${distinctCount}` : `Chữ ký TRÙNG (đã có) → không tăng`,
          en: isNew ? `NEW signature → distinct = ${distinctCount}` : `DUPLICATE signature → no increment`,
        },
        buildingCells: buildingCells.slice(),
        origin: [r0, c0],
        shape: canonicalShape,
        phase: "compare",
        event: "compare-signature",
        signature: sig,
        candidateState: isNew ? "new" : "duplicate",
        matchId: thisShapeId,
        codeLines: [19],
        vars: [
          { name: "signature", value: `{${sig}}` },
          { name: "is new?", value: isNew },
          { name: "distinct count", value: distinctCount },
        ],
        note: {
          vi: isNew
            ? `Chữ ký {${sig}} chưa có trong visited → thêm vào. Số đảo khác hình = ${distinctCount}.`
            : `Chữ ký {${sig}} đã tồn tại trong visited → đảo này TRÙNG hình với đảo trước. Không tăng.`,
          en: isNew
            ? `Signature {${sig}} not in visited → add it. Distinct islands = ${distinctCount}.`
            : `Signature {${sig}} already in visited → this island is a DUPLICATE shape. No increment.`,
        },
      });
    }
  }

  // Final (line 20)
  pushStep({
    title: { vi: `Kết quả: ${distinctCount} đảo khác hình`, en: `Result: ${distinctCount} distinct islands` },
    phase: "done",
    event: "done",
    final: true,
    codeLines: [20],
    vars: [
      { name: "total islands", value: islandCount },
      { name: "distinct shapes", value: distinctCount },
    ],
    note: {
      vi: `Có ${islandCount} đảo, trong đó ${distinctCount} hình khác nhau (số trên mỗi đảo = id hình dạng; đảo cùng số = cùng hình).`,
      en: `${islandCount} islands total, ${distinctCount} distinct shapes (number on each island = shape id; same number = same shape).`,
    },
  });

  return { original: grid, answer: distinctCount, steps };
}

/**
 * LeetCode 130: Surrounded Regions.
 * Capture all 'O' regions 4-directionally surrounded by 'X'.
 * Trick: any 'O' connected to a border 'O' is SAFE (not captured).
 *  Phase 1: DFS from every border 'O', mark connected 'O' as safe ('#').
 *  Phase 2: scan grid — 'O' → 'X' (captured), '#' → 'O' (restore safe).
 */
function buildStepsSurroundedRegions(input, params) {
  const grid = parseIslandGrid(input);
  const steps = [];

  // Approach 2 = recursive DFS with 'S' marker; shares the same algorithm/visual.
  const approach = Number(params && params.approach) || 1;
  const cb = approach === 2 ? 2 : 1;          // which code block to highlight
  const markSafeLine = approach === 2 ? 9 : 11; // line where safe cell is marked

  if (!grid.length || !grid[0].length || grid.some((row) => row.length !== grid[0].length || row.some((v) => v !== "X" && v !== "O"))) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeBlock: cb,
      codeLines: [3],
      vars: [{ name: "error", value: "invalid" }],
      note: {
        vi: "Grid phải gồm ký tự 'X' và 'O'. Ví dụ: XXXX|XOOX|XXOX|XOXX.",
        en: "Grid must contain 'X' and 'O'. Example: XXXX|XOOX|XXOX|XOXX.",
      },
    });
    return { original: grid, answer: grid, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  // status[r][c]: "X" | "O" | "safe" | "captured"
  const status = grid.map((row) => row.map((v) => v));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (r, c) => `${r},${c}`;

  function makeCells(current, frontier) {
    const fset = frontier ? new Set(frontier.map(([r, c]) => key(r, c))) : null;
    return status.map((row, r) =>
      row.map((v, c) => {
        let cls, label;
        if (v === "X") { cls = "wall"; label = "X"; }
        else if (v === "safe") { cls = "path"; label = "O"; }       // green = escaped/safe
        else if (v === "captured") { cls = "visited"; label = "X"; } // blue = flipped
        else { cls = "empty"; label = "O"; }                          // plain O
        if (fset && fset.has(key(r, c))) cls = "queued";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current = null, frontier = null, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(current, frontier) },
      highlight: [],
      mark: [],
      final,
      codeBlock: cb,
      codeLines,
      vars,
      note,
    });
  }

  // Intro
  pushStep({
    title: { vi: "Ý tưởng: 'O' nối biên thì AN TOÀN", en: "Idea: border-connected 'O' is SAFE" },
    codeLines: [2],
    vars: [
      { name: "rows", value: rows },
      { name: "cols", value: cols },
    ],
    note: {
      vi:
        `Bắt 'O' bị bao QUANH bởi 'X'. 'O' nào nối (4 hướng) tới 'O' ở BIÊN thì thoát được → AN TOÀN.\n` +
        `Phase 1: DFS từ mọi 'O' ở biên, đánh dấu chúng AN TOÀN (màu xanh).\n` +
        `Phase 2: quét lưới — 'O' còn lại → 'X' (bị bắt), 'O' an toàn → giữ 'O'.`,
      en:
        `Capture 'O' regions surrounded by 'X'. Any 'O' connected (4-dir) to a BORDER 'O' escapes → SAFE.\n` +
        `Phase 1: DFS from every border 'O', mark them SAFE (green).\n` +
        `Phase 2: scan grid — remaining 'O' → 'X' (captured), safe 'O' stays 'O'.`,
    },
  });

  // Phase 1: DFS from border 'O' cells
  const borderCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      if (isBorder && status[r][c] === "O") borderCells.push([r, c]);
    }
  }

  pushStep({
    title: { vi: `Phase 1: tìm ${borderCells.length} ô 'O' ở biên`, en: `Phase 1: find ${borderCells.length} border 'O' cells` },
    frontier: borderCells,
    codeLines: [16],
    vars: [
      { name: "border 'O' cells", value: borderCells.map(([r, c]) => `(${r},${c})`).join(" ") || "(none)" },
    ],
    note: {
      vi: `Các ô 'O' nằm ở biên (vàng) là điểm xuất phát DFS. Mọi 'O' nối tới chúng đều an toàn.`,
      en: `Border 'O' cells (yellow) are DFS start points. Every 'O' connected to them is safe.`,
    },
  });

  for (const [br, bc] of borderCells) {
    if (status[br][bc] !== "O") continue; // already marked safe

    // Step: DFS call from this border cell (line 17)
    pushStep({
      title: { vi: `Gọi dfs(${br},${bc}) từ biên`, en: `Call dfs(${br},${bc}) from border` },
      current: [br, bc],
      codeLines: [17],
      vars: [
        { name: "start", value: `(${br}, ${bc})` },
        { name: "call", value: `dfs(${br}, ${bc})` },
      ],
      note: {
        vi: `Ô biên (${br},${bc}) là 'O' → gọi dfs(${br},${bc}) để lan vùng an toàn từng ô.`,
        en: `Border cell (${br},${bc}) is 'O' → call dfs(${br},${bc}) to spread safe cell by cell.`,
      },
    });

    // DFS traversal — one step per cell visited (line-by-line)
    const stack = [[br, bc]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      if (status[cr][cc] === "safe") continue; // already marked
      status[cr][cc] = "safe";

      // Step: mark this cell safe (line 11 for approach 1, line 9 for approach 2)
      const neighborsQueued = [];
      for (const [dr, dc] of dirs) {
        const nr = cr + dr, nc = cc + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (status[nr][nc] !== "O") continue;
        neighborsQueued.push([nr, nc]);
      }

      pushStep({
        title: { vi: `dfs(${cr},${cc}): đánh dấu an toàn`, en: `dfs(${cr},${cc}): mark safe` },
        current: [cr, cc],
        frontier: neighborsQueued,
        codeLines: [markSafeLine],
        vars: [
          { name: "cell", value: `(${cr}, ${cc})` },
          { name: "mark", value: approach === 2 ? "'S' (safe)" : "'#' (safe)" },
          { name: "safe cells so far", value: status.flat().filter((v) => v === "safe").length },
        ],
        note: {
          vi: `Ô (${cr},${cc}) = 'O' → đánh dấu an toàn (xanh). Tiếp tục DFS sang 4 ô kề còn là 'O' (vàng).`,
          en: `Cell (${cr},${cc}) = 'O' → mark safe (green). Continue DFS to 4 adjacent 'O' cells (yellow).`,
        },
      });

      for (const nb of neighborsQueued) stack.push(nb);
    }
  }

  // Phase 2 intro
  pushStep({
    title: { vi: "Phase 2: quét lại toàn lưới", en: "Phase 2: scan the whole grid" },
    codeLines: [18],
    vars: [
      { name: "safe cells", value: status.flat().filter((v) => v === "safe").length },
    ],
    note: {
      vi: `Quét lại từng ô: 'O' (không an toàn) → 'X' (bắt); '#' (an toàn) → 'O' (khôi phục).`,
      en: `Rescan each cell: 'O' (unsafe) → 'X' (capture); '#' (safe) → 'O' (restore).`,
    },
  });

  // Phase 2: flip unsafe 'O' → 'X'
  let captured = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (status[r][c] === "O") {
        // Step: check board[i][j] == 'O' (line 20)
        pushStep({
          title: { vi: `(${r},${c}) là 'O' không an toàn?`, en: `Is (${r},${c}) an unsafe 'O'?` },
          current: [r, c],
          codeLines: [20],
          vars: [
            { name: "cell", value: `(${r}, ${c})` },
            { name: "board[i][j]", value: "'O'" },
          ],
          note: {
            vi: `Ô (${r},${c}) = 'O' và KHÔNG được đánh dấu an toàn → bị bao quanh.`,
            en: `Cell (${r},${c}) = 'O' and NOT marked safe → surrounded.`,
          },
        });

        // Step: board[i][j] = 'X' (line 21)
        status[r][c] = "captured";
        captured++;
        pushStep({
          title: { vi: `Bắt (${r},${c}): 'O' → 'X'`, en: `Capture (${r},${c}): 'O' → 'X'` },
          current: [r, c],
          codeLines: [21],
          vars: [
            { name: "cell", value: `(${r}, ${c})` },
            { name: "captured so far", value: captured },
          ],
          note: {
            vi: `Lật ô (${r},${c}) thành 'X'.`,
            en: `Flip cell (${r},${c}) to 'X'.`,
          },
        });
      }
    }
  }

  // Restore safe cells: '#' → 'O' (line 22-23)
  const safeCount = status.flat().filter((v) => v === "safe").length;
  if (safeCount > 0) {
    pushStep({
      title: { vi: `Khôi phục ${safeCount} ô an toàn: '#' → 'O'`, en: `Restore ${safeCount} safe cells: '#' → 'O'` },
      codeLines: [23],
      vars: [
        { name: "safe cells restored", value: safeCount },
      ],
      note: {
        vi: `Các ô an toàn (xanh) được khôi phục lại thành 'O'.`,
        en: `Safe cells (green) are restored back to 'O'.`,
      },
    });
  }

  // Final result
  const finalGrid = status.map((row) => row.map((v) => (v === "captured" ? "X" : v === "safe" ? "O" : v)));

  steps.push({
    title: { vi: `Kết quả: bắt ${captured} ô`, en: `Result: captured ${captured} cells` },
    arr: [],
    bfsGrid: {
      rows,
      cols,
      cells: finalGrid.map((row) =>
        row.map((v) => (v === "X" ? { label: "X", cls: "wall" } : { label: "O", cls: "path" }))
      ),
    },
    highlight: [],
    mark: [],
    final: true,
    codeBlock: cb,
    codeLines: [23],
    vars: [
      { name: "captured", value: captured },
      { name: "result", value: finalGrid.map((row) => row.join("")).join(" | ") },
    ],
    note: {
      vi: `Đã lật ${captured} ô 'O' bị bao quanh thành 'X'. Các 'O' an toàn (xanh) giữ nguyên.`,
      en: `Flipped ${captured} surrounded 'O' cells to 'X'. Safe 'O' cells (green) stay unchanged.`,
    },
  });

  return { original: grid, answer: finalGrid, steps };
}

/**
 * LeetCode 3977: Minimum Time to Reach Target With Limited Power.
 * Dijkstra on the expanded state graph (node, remaining power).
 */
function buildSteps3977Dijkstra(input, params) {
  const parsedN = Number(params && params.n);
  const n = Number.isInteger(parsedN) && parsedN > 0 ? parsedN : 5;
  const initialPower = Math.max(1, Number(params && params.power) || 4);
  const source = Math.min(n - 1, Math.max(0, Number(params && params.source) || 0));
  const targetValue = Number(params && params.target);
  const target = Math.min(n - 1, Math.max(0, Number.isInteger(targetValue) ? targetValue : n - 1));
  const parsedCosts = String((params && params.cost) || "")
    .split(",")
    .map((value) => Number(value.trim()));
  const cost = Array.from({ length: n }, (_, index) => (
    Number.isFinite(parsedCosts[index]) && parsedCosts[index] > 0 ? parsedCosts[index] : 1
  ));
  const edges = String(input || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(",").map((value) => Number(value.trim())))
    .filter(([u, v, time]) => (
      Number.isInteger(u) && Number.isInteger(v) && Number.isFinite(time)
      && u >= 0 && u < n && v >= 0 && v < n && time > 0
    ))
    .map(([u, v, time]) => ({ u, v, time }));

  const adjacency = Array.from({ length: n }, () => []);
  edges.forEach(({ u, v, time }) => adjacency[u].push({ v, time }));

  class MinHeap {
    constructor(compare) {
      this.data = [];
      this.compare = compare;
    }
    push(value) {
      this.data.push(value);
      let index = this.data.length - 1;
      while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (this.compare(this.data[parent], value) <= 0) break;
        this.data[index] = this.data[parent];
        index = parent;
      }
      this.data[index] = value;
    }
    pop() {
      if (!this.data.length) return null;
      const root = this.data[0];
      const last = this.data.pop();
      if (this.data.length) {
        let index = 0;
        while (true) {
          let child = index * 2 + 1;
          if (child >= this.data.length) break;
          if (child + 1 < this.data.length && this.compare(this.data[child + 1], this.data[child]) < 0) child += 1;
          if (this.compare(last, this.data[child]) <= 0) break;
          this.data[index] = this.data[child];
          index = child;
        }
        this.data[index] = last;
      }
      return root;
    }
    get length() { return this.data.length; }
  }

  const compareStates = (a, b) => a.time - b.time || b.power - a.power || a.node - b.node;
  const heap = new MinHeap(compareStates);
  const dist = Array.from({ length: n }, () => new Map());
  const discovered = new Map();
  const settled = new Set();
  const stateEdges = [];
  const steps = [];
  const stateId = (node, power) => `${node}|${power}`;

  function rememberState(node, power, time) {
    const id = stateId(node, power);
    const previous = discovered.get(id);
    if (!previous || time < previous.time) discovered.set(id, { id, node, power, time });
    return id;
  }

  function heapLabel() {
    const ordered = heap.data.slice().sort(compareStates);
    const shown = ordered.slice(0, 8).map((state) => `(t=${state.time}, n=${state.node}, p=${state.power})`);
    return `[${shown.join(", ")}${ordered.length > 8 ? `, ... +${ordered.length - 8}` : ""}]`;
  }

  function graphSnapshot(hlNodes = [], hlEdges = []) {
    const annotations = {};
    const nodes = [...discovered.values()].map((state) => {
      annotations[state.id] = `t=${state.time}`;
      return { id: state.id, label: `${state.node},${state.power}` };
    });
    return {
      nodes,
      edges: stateEdges.map((edge) => ({ ...edge })),
      hlNodes,
      hlEdges,
      visitedNodes: [...settled],
      annotations,
      caption: {
        vi: "Mỗi nút là một trạng thái (node, điện còn lại); nhãn trên nút là thời gian tốt nhất.",
        en: "Each node is a (node, remaining power) state; the label above it is the best time.",
      },
    };
  }

  function pushStep({ title, codeLines, hlNodes = [], hlEdges = [], vars = [], note, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: graphSnapshot(hlNodes, hlEdges),
      highlight: [],
      mark: [],
      codeLines,
      vars: [
        { name: "heap", value: heapLabel() },
        { name: "states discovered", value: discovered.size },
        ...vars,
      ],
      note,
      final,
    });
  }

  pushStep({
    title: { vi: "Tạo adjacency list rỗng", en: "Create an empty adjacency list" },
    codeLines: [6],
    vars: [{ name: "graph", value: "{}" }],
    note: {
      vi: "graph[u] sẽ lưu các cặp (node kế tiếp, thời gian đi cạnh).",
      en: "graph[u] will store (next node, edge travel time) pairs.",
    },
  });

  const shownAdjacency = Array.from({ length: n }, () => []);
  for (const edge of edges) {
    pushStep({
      title: { vi: `Đọc cạnh [${edge.u}, ${edge.v}, ${edge.time}]`, en: `Read edge [${edge.u}, ${edge.v}, ${edge.time}]` },
      codeLines: [7],
      vars: [
        { name: "u", value: edge.u },
        { name: "v", value: edge.v },
        { name: "travel_time", value: edge.time },
      ],
      note: {
        vi: `Vòng for lấy cạnh có hướng ${edge.u}→${edge.v}, mất ${edge.time} giây.`,
        en: `The loop reads directed edge ${edge.u}→${edge.v}, taking ${edge.time} seconds.`,
      },
    });
    shownAdjacency[edge.u].push(`(${edge.v},${edge.time})`);
    pushStep({
      title: { vi: `graph[${edge.u}].append((${edge.v}, ${edge.time}))`, en: `graph[${edge.u}].append((${edge.v}, ${edge.time}))` },
      codeLines: [8],
      vars: [{ name: `graph[${edge.u}]`, value: `[${shownAdjacency[edge.u].join(", ")}]` }],
      note: {
        vi: `Thêm node ${edge.v} và thời gian ${edge.time} vào danh sách cạnh đi ra của node ${edge.u}.`,
        en: `Add node ${edge.v} and time ${edge.time} to node ${edge.u}'s outgoing edges.`,
      },
    });
  }

  pushStep({
    title: { vi: "INF = ∞", en: "INF = ∞" },
    codeLines: [9],
    vars: [{ name: "INF", value: "∞" }],
    note: {
      vi: "Dùng ∞ để biểu diễn những trạng thái chưa thể đến được.",
      en: "Use ∞ for states that have not been reached.",
    },
  });
  pushStep({
    title: { vi: `Tạo bảng dist ${n} × ${initialPower + 1}`, en: `Create a ${n} × ${initialPower + 1} dist table` },
    codeLines: [10],
    vars: [{ name: "dist shape", value: `${n} × ${initialPower + 1}` }],
    note: {
      vi: "dist[u][p] là thời gian nhỏ nhất đã biết để tới node u và còn đúng p điện.",
      en: "dist[u][p] is the best known time to reach node u with exactly p power remaining.",
    },
  });

  dist[source].set(initialPower, 0);
  const startId = rememberState(source, initialPower, 0);
  pushStep({
    title: { vi: `dist[${source}][${initialPower}] = 0`, en: `dist[${source}][${initialPower}] = 0` },
    codeLines: [11],
    hlNodes: [startId],
    vars: [
      { name: "source", value: source },
      { name: "target", value: target },
      { name: `dist[${source}][${initialPower}]`, value: 0 },
      { name: "cost", value: `[${cost.join(", ")}]` },
    ],
    note: {
      vi: `Trạng thái bắt đầu là (${source}, ${initialPower}): đang ở source, còn nguyên điện và thời gian bằng 0.`,
      en: `The initial state is (${source}, ${initialPower}): at source with full power at time 0.`,
    },
  });
  heap.push({ time: 0, power: initialPower, node: source });
  pushStep({
    title: { vi: "Đưa trạng thái bắt đầu vào heap", en: "Push the initial state into the heap" },
    codeLines: [12],
    hlNodes: [startId],
    vars: [{ name: "pushed", value: `(0, -${initialPower}, ${source})` }],
    note: {
      vi: "Heap lưu -power để khi time bằng nhau, Python ưu tiên trạng thái có power lớn hơn.",
      en: "The heap stores -power so equal-time entries prefer the state with more power.",
    },
  });

  let answer = [-1, -1];
  while (heap.length) {
    const nextState = heap.data.slice().sort(compareStates)[0];
    pushStep({
      title: { vi: `while heap: còn ${heap.length} trạng thái`, en: `while heap: ${heap.length} state(s) remain` },
      codeLines: [13],
      hlNodes: [stateId(nextState.node, nextState.power)],
      vars: [{ name: "heap is not empty", value: true }],
      note: {
        vi: "Heap chưa rỗng nên Dijkstra tiếp tục lấy trạng thái tốt nhất ra xử lý.",
        en: "The heap is not empty, so Dijkstra continues with its best state.",
      },
    });

    const current = heap.pop();
    const { time, power: poppedPower, node: u } = current;
    const currentId = stateId(u, poppedPower);
    pushStep({
      title: { vi: `heappop → (t=${time}, -p=${-poppedPower}, u=${u})`, en: `heappop → (t=${time}, -p=${-poppedPower}, u=${u})` },
      codeLines: [14],
      hlNodes: [currentId],
      vars: [
        { name: "time", value: time },
        { name: "neg_power", value: -poppedPower },
        { name: "u", value: u },
      ],
      note: {
        vi: "Lấy phần tử đầu heap. Heap đã bỏ trạng thái này trước khi chuyển sang dòng tiếp theo.",
        en: "Pop the top heap entry. It is removed from the heap before the next line.",
      },
    });

    const remaining = poppedPower;
    pushStep({
      title: { vi: `remaining = -neg_power = ${remaining}`, en: `remaining = -neg_power = ${remaining}` },
      codeLines: [15],
      hlNodes: [currentId],
      vars: [
        { name: "u", value: u },
        { name: "time", value: time },
        { name: "remaining", value: remaining },
      ],
      note: {
        vi: `Đổi lại dấu để lấy lượng điện thật: trạng thái hiện tại là (${u}, ${remaining}) tại t=${time}.`,
        en: `Negate the stored value to recover power: current state is (${u}, ${remaining}) at t=${time}.`,
      },
    });

    const isStale = dist[u].get(remaining) !== time;
    pushStep({
      title: { vi: `time != dist[u][remaining]? ${isStale}`, en: `time != dist[u][remaining]? ${isStale}` },
      codeLines: [16],
      hlNodes: [currentId],
      vars: [
        { name: "time", value: time },
        { name: `dist[${u}][${remaining}]`, value: dist[u].get(remaining) },
        { name: "stale", value: isStale },
      ],
      note: {
        vi: isStale
          ? "Đã có thời gian tốt hơn cho đúng trạng thái này, nên continue và bỏ bản ghi heap cũ."
          : "time khớp dist hiện tại; đây là bản ghi mới nhất nên tiếp tục xử lý.",
        en: isStale
          ? "A better time exists for this exact state, so continue and discard the stale heap entry."
          : "time matches the current dist; this entry is current, so keep processing it.",
      },
    });
    if (isStale) {
      continue;
    }

    settled.add(currentId);
    const reachedTarget = u === target;
    if (reachedTarget) answer = [time, remaining];
    pushStep({
      title: { vi: `u == target? ${reachedTarget}`, en: `u == target? ${reachedTarget}` },
      codeLines: [17],
      hlNodes: [currentId],
      vars: [
        { name: "u", value: u },
        { name: "target", value: target },
        ...(reachedTarget ? [{ name: "answer", value: `[${time}, ${remaining}]` }] : []),
      ],
      note: reachedTarget ? {
        vi: `Đây là thời gian nhỏ nhất để đến node ${target}; cách sắp xếp heap cũng cho lượng điện còn lại lớn nhất khi hòa thời gian.`,
        en: `This is the minimum time to node ${target}; heap ordering also gives the most remaining power on a time tie.`,
      } : {
        vi: `Node hiện tại là ${u}, chưa phải target ${target}, nên cần thử các cạnh đi ra.`,
        en: `Current node ${u} is not target ${target}, so inspect its outgoing edges.`,
      },
      final: reachedTarget,
    });
    if (reachedTarget) {
      break;
    }

    const insufficientPower = remaining < cost[u];
    pushStep({
      title: { vi: `remaining < cost[${u}]? ${insufficientPower}`, en: `remaining < cost[${u}]? ${insufficientPower}` },
      codeLines: [18],
      hlNodes: [currentId],
      vars: [
        { name: "remaining", value: remaining },
        { name: `cost[${u}]`, value: cost[u] },
        { name: "insufficient", value: insufficientPower },
      ],
      note: insufficientPower ? {
        vi: `Chỉ còn ${remaining} điện nhưng cần ${cost[u]} để rời node ${u}; continue, không xét cạnh nào.`,
        en: `Only ${remaining} power remains but leaving node ${u} requires ${cost[u]}; continue without examining edges.`,
      } : {
        vi: `Còn đủ điện để rời node ${u}, nên tiếp tục tính next_power.`,
        en: `There is enough power to leave node ${u}, so compute next_power.`,
      },
    });
    if (insufficientPower) {
      continue;
    }

    const nextPower = remaining - cost[u];
    pushStep({
      title: { vi: `next_power = ${remaining} - ${cost[u]} = ${nextPower}`, en: `next_power = ${remaining} - ${cost[u]} = ${nextPower}` },
      codeLines: [19],
      hlNodes: [currentId],
      vars: [
        { name: "remaining", value: remaining },
        { name: `cost[${u}]`, value: cost[u] },
        { name: "next_power", value: nextPower },
      ],
      note: {
        vi: `Điện bị trừ một lần khi rời node ${u}; mọi cạnh đi ra đều dẫn tới cùng mức điện ${nextPower}.`,
        en: `Power is consumed once when leaving node ${u}; every outgoing edge leads to power ${nextPower}.`,
      },
    });

    for (const edge of adjacency[u]) {
      const nextId = stateId(edge.v, nextPower);
      pushStep({
        title: { vi: `Xét cạnh ${u}→${edge.v} (time=${edge.time})`, en: `Inspect edge ${u}→${edge.v} (time=${edge.time})` },
        codeLines: [20],
        hlNodes: [currentId],
        vars: [
          { name: "v", value: edge.v },
          { name: "travel_time", value: edge.time },
          { name: "next_power", value: nextPower },
        ],
        note: {
          vi: `Vòng for lấy cạnh ${u}→${edge.v}; ứng viên sẽ tới trạng thái (${edge.v}, ${nextPower}).`,
          en: `The loop reads edge ${u}→${edge.v}; the candidate reaches state (${edge.v}, ${nextPower}).`,
        },
      });

      const nextTime = time + edge.time;
      pushStep({
        title: { vi: `next_time = ${time} + ${edge.time} = ${nextTime}`, en: `next_time = ${time} + ${edge.time} = ${nextTime}` },
        codeLines: [21],
        hlNodes: [currentId],
        vars: [
          { name: "time", value: time },
          { name: "travel_time", value: edge.time },
          { name: "next_time", value: nextTime },
        ],
        note: {
          vi: `Cộng thời gian của cạnh vào thời gian hiện tại để tạo thời gian ứng viên ${nextTime}.`,
          en: `Add the edge travel time to obtain candidate time ${nextTime}.`,
        },
      });

      const oldTime = dist[edge.v].has(nextPower) ? dist[edge.v].get(nextPower) : Infinity;
      const improves = nextTime < oldTime;
      pushStep({
        title: { vi: `${nextTime} < ${oldTime === Infinity ? "∞" : oldTime}? ${improves}`, en: `${nextTime} < ${oldTime === Infinity ? "∞" : oldTime}? ${improves}` },
        codeLines: [22],
        hlNodes: [currentId, nextId].filter((id) => discovered.has(id)),
        vars: [
          { name: "next_time", value: nextTime },
          { name: `dist[${edge.v}][${nextPower}]`, value: oldTime === Infinity ? "∞" : oldTime },
          { name: "improves", value: improves },
        ],
        note: improves ? {
          vi: `Ứng viên ${nextTime} tốt hơn dist cũ, nên cập nhật trạng thái (${edge.v}, ${nextPower}).`,
          en: `Candidate ${nextTime} improves the old dist, so update state (${edge.v}, ${nextPower}).`,
        } : {
          vi: `Đã có đường tới (${edge.v}, ${nextPower}) nhanh bằng hoặc nhanh hơn; bỏ qua ứng viên này.`,
          en: `State (${edge.v}, ${nextPower}) already has an equal or faster path; discard this candidate.`,
        },
      });

      if (improves) {
        dist[edge.v].set(nextPower, nextTime);
        rememberState(edge.v, nextPower, nextTime);
        stateEdges.push({ u: currentId, v: nextId, w: edge.time });
        pushStep({
          title: { vi: `dist[${edge.v}][${nextPower}] = ${nextTime}`, en: `dist[${edge.v}][${nextPower}] = ${nextTime}` },
          codeLines: [23],
          hlNodes: [currentId, nextId],
          hlEdges: [[currentId, nextId]],
          vars: [
            { name: "old dist", value: oldTime === Infinity ? "∞" : oldTime },
            { name: "new dist", value: nextTime },
          ],
          note: {
            vi: `Ghi thời gian tốt nhất mới cho trạng thái (${edge.v}, ${nextPower}) và vẽ cạnh trạng thái tương ứng.`,
            en: `Store the new best time for (${edge.v}, ${nextPower}) and draw its state transition edge.`,
          },
        });

        heap.push({ time: nextTime, power: nextPower, node: edge.v });
        pushStep({
          title: { vi: `heappush (${nextTime}, -${nextPower}, ${edge.v})`, en: `heappush (${nextTime}, -${nextPower}, ${edge.v})` },
          codeLines: [24],
          hlNodes: [nextId],
          vars: [
            { name: "pushed time", value: nextTime },
            { name: "pushed power", value: nextPower },
            { name: "pushed node", value: edge.v },
          ],
          note: {
            vi: `Đưa trạng thái mới (${edge.v}, ${nextPower}) vào heap để xử lý theo thứ tự thời gian.`,
            en: `Push the new state (${edge.v}, ${nextPower}) so it can be processed in time order.`,
          },
        });
      }
    }
  }

  if (answer[0] === -1) {
    pushStep({
      title: { vi: "Không thể đến target", en: "Target is unreachable" },
      codeLines: [25],
      vars: [{ name: "answer", value: "[-1, -1]" }],
      note: {
        vi: `Heap đã rỗng mà chưa đến node ${target}; không tồn tại đường đi hợp lệ với ${initialPower} điện ban đầu.`,
        en: `The heap is empty without reaching node ${target}; no valid path exists with ${initialPower} initial power.`,
      },
      final: true,
    });
  }

  return { n, edges, power: initialPower, cost, source, target, answer, steps };
}

/**
 * Approach 2 for LeetCode 3977: layered DP by remaining power.
 * Every transition consumes at least one power, so the expanded state graph is
 * a DAG when layers are processed from high power to low power.
 */
function buildSteps3977PowerDP(input, params) {
  const parsedN = Number(params && params.n);
  const n = Number.isInteger(parsedN) && parsedN > 0 ? parsedN : 5;
  const initialPower = Math.max(1, Number(params && params.power) || 4);
  const source = Math.min(n - 1, Math.max(0, Number(params && params.source) || 0));
  const targetValue = Number(params && params.target);
  const target = Math.min(n - 1, Math.max(0, Number.isInteger(targetValue) ? targetValue : n - 1));
  const parsedCosts = String((params && params.cost) || "")
    .split(",")
    .map((value) => Number(value.trim()));
  const cost = Array.from({ length: n }, (_, index) => (
    Number.isFinite(parsedCosts[index]) && parsedCosts[index] > 0 ? parsedCosts[index] : 1
  ));
  const edges = String(input || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(",").map((value) => Number(value.trim())))
    .filter(([u, v, time]) => (
      Number.isInteger(u) && Number.isInteger(v) && Number.isFinite(time)
      && u >= 0 && u < n && v >= 0 && v < n && time > 0
    ))
    .map(([u, v, time]) => ({ u, v, time }));

  const adjacency = Array.from({ length: n }, () => []);
  const dp = Array.from({ length: n }, () => Array(initialPower + 1).fill(Infinity));
  const discovered = new Map();
  const processed = new Set();
  const stateEdges = [];
  const steps = [];
  const maxDetailedSteps = 500;
  let summarizedSteps = 0;
  const stateId = (node, power) => `${node}|${power}`;

  function remember(node, power, time) {
    const id = stateId(node, power);
    discovered.set(id, { id, node, power, time });
    return id;
  }

  function graphSnapshot(hlNodes = [], hlEdges = []) {
    const allStates = [...discovered.values()];
    const chosen = allStates.slice(0, 70);
    const chosenIds = new Set(chosen.map((state) => state.id));
    for (const id of hlNodes) {
      if (!chosenIds.has(id) && discovered.has(id)) {
        chosen.push(discovered.get(id));
        chosenIds.add(id);
      }
    }
    const annotations = {};
    const nodes = chosen.map((state) => {
      annotations[state.id] = `t=${state.time}`;
      return { id: state.id, label: `${state.node},${state.power}` };
    });
    return {
      nodes,
      edges: stateEdges.filter((edge) => chosenIds.has(edge.u) && chosenIds.has(edge.v)).map((edge) => ({ ...edge })),
      hlNodes: hlNodes.filter((id) => chosenIds.has(id)),
      hlEdges: hlEdges.filter(([u, v]) => chosenIds.has(u) && chosenIds.has(v)),
      visitedNodes: [...processed].filter((id) => chosenIds.has(id)),
      annotations,
      caption: {
        vi: "Mỗi node là trạng thái (node, điện còn lại). DP quét từng tầng điện từ cao xuống thấp.",
        en: "Each node is a (node, remaining power) state. DP scans power layers from high to low.",
      },
    };
  }

  function pushStep({ title, codeLine, hlNodes = [], hlEdges = [], vars = [], note, final = false }) {
    if (!final && steps.length >= maxDetailedSteps) {
      summarizedSteps++;
      return;
    }
    steps.push({
      title,
      arr: [],
      graph: graphSnapshot(hlNodes, hlEdges),
      highlight: [],
      mark: [],
      codeLines: [codeLine],
      codeBlock: 2,
      vars: [
        { name: "reachable states", value: discovered.size },
        ...(summarizedSteps > 0 ? [{ name: "steps summarized", value: summarizedSteps }] : []),
        ...vars,
      ],
      note,
      final,
    });
  }

  pushStep({
    title: { vi: "Tạo adjacency list", en: "Create the adjacency list" },
    codeLine: 4,
    vars: [{ name: "graph", value: "{}" }],
    note: { vi: "graph[u] lưu các cạnh đi ra khỏi u.", en: "graph[u] stores edges leaving u." },
  });

  const shownAdjacency = Array.from({ length: n }, () => []);
  for (const edge of edges) {
    pushStep({
      title: { vi: `Đọc cạnh ${edge.u}→${edge.v}`, en: `Read edge ${edge.u}→${edge.v}` },
      codeLine: 5,
      vars: [{ name: "u", value: edge.u }, { name: "v", value: edge.v }, { name: "travel_time", value: edge.time }],
      note: { vi: `Cạnh mất ${edge.time} giây.`, en: `The edge takes ${edge.time} seconds.` },
    });
    adjacency[edge.u].push({ v: edge.v, time: edge.time });
    shownAdjacency[edge.u].push(`(${edge.v},${edge.time})`);
    pushStep({
      title: { vi: `graph[${edge.u}].append((${edge.v}, ${edge.time}))`, en: `graph[${edge.u}].append((${edge.v}, ${edge.time}))` },
      codeLine: 6,
      vars: [{ name: `graph[${edge.u}]`, value: `[${shownAdjacency[edge.u].join(", ")}]` }],
      note: { vi: "Thêm cạnh vào adjacency list.", en: "Append the edge to the adjacency list." },
    });
  }

  pushStep({
    title: { vi: "INF = ∞", en: "INF = ∞" }, codeLine: 7,
    vars: [{ name: "INF", value: "∞" }],
    note: { vi: "∞ biểu diễn trạng thái chưa tới được.", en: "∞ represents an unreachable state." },
  });
  pushStep({
    title: { vi: `Tạo bảng dp ${n} × ${initialPower + 1}`, en: `Create a ${n} × ${initialPower + 1} dp table` },
    codeLine: 8,
    vars: [{ name: "dp shape", value: `${n} × ${initialPower + 1}` }],
    note: {
      vi: "dp[u][p] là thời gian nhỏ nhất để đến u với đúng p điện còn lại.",
      en: "dp[u][p] is the minimum time to reach u with exactly p power remaining.",
    },
  });

  dp[source][initialPower] = 0;
  const startId = remember(source, initialPower, 0);
  pushStep({
    title: { vi: `dp[${source}][${initialPower}] = 0`, en: `dp[${source}][${initialPower}] = 0` },
    codeLine: 9, hlNodes: [startId],
    vars: [{ name: "source", value: source }, { name: "power", value: initialPower }, { name: "cost", value: `[${cost.join(", ")}]` }],
    note: { vi: "Khởi tạo trạng thái nguồn với toàn bộ điện.", en: "Initialize the source state with full power." },
  });

  for (let remaining = initialPower; remaining >= 0; remaining--) {
    const reachableInLayer = Array.from({ length: n }, (_, u) => Number.isFinite(dp[u][remaining]) ? u : -1).filter((u) => u >= 0);
    pushStep({
      title: { vi: `Quét tầng điện remaining=${remaining}`, en: `Scan power layer remaining=${remaining}` },
      codeLine: 10,
      hlNodes: reachableInLayer.map((u) => stateId(u, remaining)),
      vars: [{ name: "remaining", value: remaining }, { name: "reachable nodes", value: `[${reachableInLayer.join(", ")}]` }],
      note: {
        vi: "Mọi chuyển trạng thái đều sang tầng điện thấp hơn, nên thứ tự giảm dần là thứ tự topo hợp lệ.",
        en: "Every transition goes to a lower power layer, so descending power is a valid topological order.",
      },
    });

    for (let u = 0; u < n; u++) {
      const currentId = stateId(u, remaining);
      pushStep({
        title: { vi: `Xét node u=${u} ở tầng ${remaining}`, en: `Inspect node u=${u} in layer ${remaining}` },
        codeLine: 11,
        hlNodes: discovered.has(currentId) ? [currentId] : [],
        vars: [{ name: "u", value: u }, { name: "remaining", value: remaining }],
        note: { vi: "Đọc ô DP tương ứng với node và lượng điện này.", en: "Read the DP cell for this node and power level." },
      });

      const time = dp[u][remaining];
      pushStep({
        title: { vi: `time = ${Number.isFinite(time) ? time : "∞"}`, en: `time = ${Number.isFinite(time) ? time : "∞"}` },
        codeLine: 12,
        hlNodes: discovered.has(currentId) ? [currentId] : [],
        vars: [{ name: `dp[${u}][${remaining}]`, value: Number.isFinite(time) ? time : "∞" }],
        note: Number.isFinite(time)
          ? { vi: "Trạng thái này tới được, tiếp tục kiểm tra điện.", en: "This state is reachable; continue with the power check." }
          : { vi: "Trạng thái chưa tới được.", en: "This state is unreachable." },
      });

      const unreachable = !Number.isFinite(time);
      pushStep({
        title: { vi: `time == INF? ${unreachable}`, en: `time == INF? ${unreachable}` },
        codeLine: 13,
        hlNodes: discovered.has(currentId) ? [currentId] : [],
        vars: [{ name: "skip", value: unreachable }],
        note: unreachable
          ? { vi: "continue vì không có đường tới trạng thái này.", en: "Continue because no path reaches this state." }
          : { vi: "Có thời gian hợp lệ nên không bỏ qua.", en: "A valid time exists, so do not skip it." },
      });
      if (unreachable) continue;

      processed.add(currentId);
      const insufficient = remaining < cost[u];
      pushStep({
        title: { vi: `remaining < cost[${u}]? ${insufficient}`, en: `remaining < cost[${u}]? ${insufficient}` },
        codeLine: 14, hlNodes: [currentId],
        vars: [{ name: "remaining", value: remaining }, { name: `cost[${u}]`, value: cost[u] }, { name: "skip", value: insufficient }],
        note: insufficient
          ? { vi: "Không đủ điện rời node, nên continue.", en: "There is not enough power to leave the node, so continue." }
          : { vi: "Đủ điện để đi qua các cạnh đi ra.", en: "There is enough power to traverse outgoing edges." },
      });
      if (insufficient) continue;

      const nextPower = remaining - cost[u];
      pushStep({
        title: { vi: `next_power = ${remaining} - ${cost[u]} = ${nextPower}`, en: `next_power = ${remaining} - ${cost[u]} = ${nextPower}` },
        codeLine: 15, hlNodes: [currentId],
        vars: [{ name: "next_power", value: nextPower }],
        note: { vi: "Cạnh tiếp theo luôn đi xuống một tầng điện thấp hơn.", en: "The next edge always moves to a lower power layer." },
      });

      for (const edge of adjacency[u]) {
        const nextId = stateId(edge.v, nextPower);
        pushStep({
          title: { vi: `Xét cạnh ${u}→${edge.v}`, en: `Inspect edge ${u}→${edge.v}` },
          codeLine: 16, hlNodes: [currentId],
          vars: [{ name: "v", value: edge.v }, { name: "travel_time", value: edge.time }],
          note: { vi: `Ứng viên đi tới trạng thái (${edge.v}, ${nextPower}).`, en: `The candidate reaches state (${edge.v}, ${nextPower}).` },
        });

        const nextTime = time + edge.time;
        pushStep({
          title: { vi: `next_time = ${time} + ${edge.time} = ${nextTime}`, en: `next_time = ${time} + ${edge.time} = ${nextTime}` },
          codeLine: 17, hlNodes: [currentId],
          vars: [{ name: "next_time", value: nextTime }],
          note: { vi: "Cộng thời gian cạnh vào thời gian hiện tại.", en: "Add the edge travel time to the current time." },
        });

        const oldTime = dp[edge.v][nextPower];
        const improves = nextTime < oldTime;
        pushStep({
          title: { vi: `${nextTime} < ${Number.isFinite(oldTime) ? oldTime : "∞"}? ${improves}`, en: `${nextTime} < ${Number.isFinite(oldTime) ? oldTime : "∞"}? ${improves}` },
          codeLine: 18,
          hlNodes: [currentId, nextId].filter((id) => discovered.has(id)),
          vars: [{ name: "candidate", value: nextTime }, { name: "old time", value: Number.isFinite(oldTime) ? oldTime : "∞" }, { name: "improves", value: improves }],
          note: improves
            ? { vi: "Ứng viên tốt hơn nên cập nhật DP.", en: "The candidate is better, so update DP." }
            : { vi: "Đã có thời gian nhanh bằng hoặc nhanh hơn.", en: "An equal or faster time already exists." },
        });

        if (improves) {
          dp[edge.v][nextPower] = nextTime;
          remember(edge.v, nextPower, nextTime);
          stateEdges.push({ u: currentId, v: nextId, w: edge.time });
          pushStep({
            title: { vi: `dp[${edge.v}][${nextPower}] = ${nextTime}`, en: `dp[${edge.v}][${nextPower}] = ${nextTime}` },
            codeLine: 19, hlNodes: [currentId, nextId], hlEdges: [[currentId, nextId]],
            vars: [{ name: "new time", value: nextTime }],
            note: { vi: "Lưu thời gian mới cho trạng thái ở tầng điện thấp hơn.", en: "Store the new time for the state in the lower power layer." },
          });
        }
      }
    }
  }

  let bestTime = Infinity;
  let bestPower = -1;
  pushStep({
    title: { vi: "Khởi tạo đáp án", en: "Initialize the answer" }, codeLine: 20,
    vars: [{ name: "best_time", value: "∞" }],
    note: { vi: "Bắt đầu tìm trạng thái tốt nhất tại target.", en: "Begin searching for the best target state." },
  });
  pushStep({
    title: { vi: "best_power = -1", en: "best_power = -1" }, codeLine: 21,
    vars: [{ name: "best_power", value: -1 }],
    note: { vi: "-1 biểu thị chưa tìm thấy đường hợp lệ.", en: "-1 means no valid path has been found." },
  });

  for (let remaining = initialPower; remaining >= 0; remaining--) {
    const targetId = stateId(target, remaining);
    const targetTime = dp[target][remaining];
    pushStep({
      title: { vi: `Kiểm tra target với power=${remaining}`, en: `Check target with power=${remaining}` },
      codeLine: 22, hlNodes: discovered.has(targetId) ? [targetId] : [],
      vars: [{ name: "remaining", value: remaining }, { name: "target time", value: Number.isFinite(targetTime) ? targetTime : "∞" }],
      note: { vi: "Quét điện từ cao xuống thấp để ưu tiên nhiều điện khi thời gian hòa.", en: "Scan power from high to low to prefer more power on a time tie." },
    });
    const improves = targetTime < bestTime;
    pushStep({
      title: { vi: `target_time < best_time? ${improves}`, en: `target_time < best_time? ${improves}` },
      codeLine: 23, hlNodes: discovered.has(targetId) ? [targetId] : [],
      vars: [{ name: "target time", value: Number.isFinite(targetTime) ? targetTime : "∞" }, { name: "best_time", value: Number.isFinite(bestTime) ? bestTime : "∞" }],
      note: improves
        ? { vi: "Tìm thấy thời gian tốt hơn.", en: "A better time was found." }
        : { vi: "Không cải thiện đáp án hiện tại.", en: "The current answer is not improved." },
    });
    if (improves) {
      bestTime = targetTime;
      bestPower = remaining;
      pushStep({
        title: { vi: `answer = [${bestTime}, ${bestPower}]`, en: `answer = [${bestTime}, ${bestPower}]` },
        codeLine: 24, hlNodes: [targetId],
        vars: [{ name: "best_time", value: bestTime }, { name: "best_power", value: bestPower }],
        note: { vi: "Cập nhật cặp thời gian và điện còn lại tốt nhất.", en: "Update the best time and remaining-power pair." },
      });
    }
  }

  const answer = Number.isFinite(bestTime) ? [bestTime, bestPower] : [-1, -1];
  pushStep({
    title: { vi: `Kết quả: [${answer.join(", ")}]`, en: `Result: [${answer.join(", ")}]` },
    codeLine: 25,
    hlNodes: answer[0] >= 0 ? [stateId(target, bestPower)] : [],
    vars: [{ name: "answer", value: `[${answer.join(", ")}]` }],
    note: answer[0] >= 0
      ? { vi: "Đã chọn thời gian nhỏ nhất; khi hòa, giữ lượng điện lớn nhất.", en: "The minimum time is chosen; ties keep the greatest remaining power." }
      : { vi: "Không có trạng thái target nào tới được.", en: "No target state is reachable." },
    final: true,
  });

  return { n, edges, power: initialPower, cost, source, target, answer, steps };
}

function buildSteps3977(input, params) {
  const approach = Number(params && params.approach) || 1;
  return approach === 2 ? buildSteps3977PowerDP(input, params) : buildSteps3977Dijkstra(input, params);
}

/**
 * LeetCode 332: Reconstruct Itinerary.
 * Sort adjacency list in reverse order so .pop() gives lexicographic order.
 * Post-order DFS (Hierholzer's algorithm): airport is appended to result
 * only after all its outgoing edges are exhausted. Reverse at the end.
 *
 * Code lines (1-indexed):
 *  1  from collections import defaultdict
 *  2  class Solution:
 *  3      def findItinerary(self, tickets):
 *  4          graph = defaultdict(list)
 *  5          for src, dst in sorted(tickets, reverse=True):
 *  6              graph[src].append(dst)
 *  7          result = []
 *  8          def dfs(airport):
 *  9              while graph[airport]:
 * 10                  next_dest = graph[airport].pop()
 * 11                  dfs(next_dest)
 * 12              result.append(airport)
 * 13          dfs("JFK")
 * 14          return result[::-1]
 */
function buildSteps332Approach1(input) {
  // Parse "SRC-DST" pairs separated by commas or semicolons
  const raw = String(input).split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const tickets = raw.map((pair) => {
    const parts = pair.split("-").map((s) => s.trim());
    return [parts[0], parts[1]];
  });

  const steps = [];

  // Validation
  if (
    tickets.length === 0
    || tickets.some(([s, d]) => !s || !d || s === d)
  ) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "tickets", value: "[]" }],
      note: {
        vi: "Nhập các vé dạng SRC-DST, ngăn bởi dấu phẩy. Ví dụ: JFK-MUC,MUC-LHR,LHR-SFO,SFO-SJC",
        en: "Enter tickets as SRC-DST separated by commas. Example: JFK-MUC,MUC-LHR,LHR-SFO,SFO-SJC",
      },
    });
    return { tickets: raw, answer: [], steps };
  }

  // All unique airports
  const allAirports = [...new Set(tickets.flatMap(([s, d]) => [s, d]))].sort();

  // Build graph as in the Python code: sort tickets reverse → pop gives lex order
  const graph = {};
  allAirports.forEach((a) => { graph[a] = []; });
  const sorted = [...tickets].sort((a, b) => {
    const ka = `${a[0]}-${a[1]}`;
    const kb = `${b[0]}-${b[1]}`;
    return kb.localeCompare(ka); // reverse
  });

  // Helper: make graph snapshot for step rendering
  const graphEdgesFromGraph = () => {
    const edgeList = [];
    for (const [src, dsts] of Object.entries(graph)) {
      for (const dst of dsts) {
        edgeList.push({ u: src, v: dst });
      }
    }
    return edgeList;
  };

  const graphStr = (g) => {
    return Object.entries(g)
      .filter(([, v]) => v.length > 0)
      .map(([k, v]) => `${k}: [${v.join(", ")}]`)
      .join(", ");
  };

  // Step: Initialize graph
  steps.push({
    title: { vi: "Khởi tạo graph và sắp xếp vé", en: "Build graph & sort tickets" },
    arr: [],
    graph: {
      nodes: allAirports.map((a) => ({ id: a, label: a, dist: "" })),
      edges: [],
      hlNodes: [],
      hlEdges: [],
      visitedNodes: [],
    },
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6],
    vars: [
      { name: "tickets", value: `[${tickets.map(([s, d]) => `(${s},${d})`).join(", ")}]` },
    ],
    note: {
      vi:
        "Sắp xếp vé theo thứ tự đảo ngược (reverse=True) để có thể dùng pop() lấy điểm đến nhỏ nhất theo thứ tự từ điển.\n" +
        "Vì pop() lấy phần tử cuối mảng, nên lưu theo thứ tự ngược là mẹo để lấy phần tử nhỏ nhất trước.",
      en:
        "Sort tickets in reverse order so .pop() returns destinations in lexicographic order.\n" +
        "Since .pop() takes the last element, storing in reverse means the smallest destination is always at the back.",
    },
  });

  // Fill graph from sorted tickets
  for (const [src, dst] of sorted) {
    graph[src].push(dst);
    steps.push({
      title: { vi: `graph[${src}].append(${dst})`, en: `graph[${src}].append(${dst})` },
      arr: [],
      graph: {
        nodes: allAirports.map((a) => ({ id: a, label: a, dist: "" })),
        edges: graphEdgesFromGraph(),
        hlNodes: [src, dst],
        hlEdges: [[src, dst]],
        visitedNodes: [],
      },
      highlight: [],
      mark: [],
      codeLines: [5, 6],
      vars: [
        { name: "src", value: src },
        { name: "dst", value: dst },
        { name: "graph", value: `{${graphStr(graph)}}` },
      ],
      note: {
        vi: `Thêm cạnh ${src} → ${dst} vào adjacency list của ${src}.`,
        en: `Append destination ${dst} to ${src}'s adjacency list.`,
      },
    });
  }

  // Show initial adjacency list — all edges loaded
  const allEdgesSnapshot = graphEdgesFromGraph();
  steps.push({
    title: { vi: "Graph đã xây dựng xong — bắt đầu DFS từ JFK", en: "Graph built — start DFS from JFK" },
    arr: [],
    graph: {
      nodes: allAirports.map((a) => ({ id: a, label: a, dist: "" })),
      edges: allEdgesSnapshot,
      hlNodes: ["JFK"],
      hlEdges: [],
      visitedNodes: [],
    },
    highlight: [],
    mark: [],
    codeLines: [7, 13],
    vars: [
      { name: "graph", value: `{${graphStr(graph)}}` },
      { name: "result", value: "[]" },
      { name: "start", value: "JFK" },
    ],
    note: {
      vi:
        "result = []; gọi dfs('JFK').\n" +
        "DFS theo Hierholzer: chỉ append airport vào result SAU KHI tất cả cạnh đi ra đã được dùng.\n" +
        "Đảo ngược result ở cuối để có hành trình.",
      en:
        "result = []; call dfs('JFK').\n" +
        "Hierholzer's DFS: only append an airport AFTER all its outgoing edges are exhausted.\n" +
        "Reverse result at the end to get the itinerary.",
    },
  });

  // Run DFS with step recording
  const result = [];
  const visited = new Set(); // airports fully processed
  const callStack = []; // track DFS call depth for display

  function dfs(airport) {
    callStack.push(airport);
    const stackStr = callStack.join(" → ");

    steps.push({
      title: { vi: `dfs(${airport}) gọi`, en: `dfs(${airport}) called` },
      arr: [],
      graph: {
        nodes: allAirports.map((a) => ({
          id: a,
          label: a,
          dist: result.includes(a) ? "✓" : "",
        })),
        edges: graphEdgesFromGraph(),
        hlNodes: [airport],
        hlEdges: [],
        visitedNodes: [...visited],
      },
      highlight: [],
      mark: [],
      codeLines: [8, 9],
      vars: [
        { name: "airport", value: airport },
        { name: "graph[airport]", value: `[${graph[airport].join(", ")}]` },
        { name: "call stack", value: stackStr },
        { name: "result", value: `[${result.join(", ")}]` },
      ],
      note: {
        vi: `Vào dfs(${airport}). Adjacency list: [${graph[airport].join(", ")}]. Khi còn vé, pop điểm đến nhỏ nhất và đệ quy.`,
        en: `Enter dfs(${airport}). Adjacency list: [${graph[airport].join(", ")}]. While tickets exist, pop the smallest dest and recurse.`,
      },
    });

    while (graph[airport].length > 0) {
      const next = graph[airport].pop();

      steps.push({
        title: { vi: `pop ${next} từ graph[${airport}] → dfs(${next})`, en: `pop ${next} from graph[${airport}] → dfs(${next})` },
        arr: [],
        graph: {
          nodes: allAirports.map((a) => ({
            id: a,
            label: a,
            dist: result.includes(a) ? "✓" : "",
          })),
          edges: graphEdgesFromGraph(),
          hlNodes: [airport, next],
          hlEdges: [[airport, next]],
          visitedNodes: [...visited],
        },
        highlight: [],
        mark: [],
        codeLines: [10, 11],
        vars: [
          { name: "airport", value: airport },
          { name: "next_dest", value: next },
          { name: "graph[airport] after pop", value: `[${graph[airport].join(", ")}]` },
          { name: "call stack", value: stackStr + ` → ${next}` },
        ],
        note: {
          vi: `graph[${airport}].pop() = ${next}. Cạnh ${airport} → ${next} được dùng và xóa khỏi graph. Gọi đệ quy dfs(${next}).`,
          en: `graph[${airport}].pop() = ${next}. Edge ${airport} → ${next} is used and removed. Recurse into dfs(${next}).`,
        },
      });

      dfs(next);
    }

    // All edges exhausted — append to result (post-order)
    result.push(airport);
    visited.add(airport);
    callStack.pop();

    steps.push({
      title: { vi: `graph[${airport}] rỗng → result.append(${airport})`, en: `graph[${airport}] empty → result.append(${airport})` },
      arr: [],
      graph: {
        nodes: allAirports.map((a) => ({
          id: a,
          label: a,
          dist: result.includes(a) ? "✓" : "",
        })),
        edges: graphEdgesFromGraph(),
        hlNodes: [airport],
        hlEdges: [],
        visitedNodes: [...visited],
      },
      highlight: [],
      mark: [],
      codeLines: [9, 12],
      vars: [
        { name: "airport", value: airport },
        { name: "result (before reverse)", value: `[${result.join(", ")}]` },
        { name: "call stack", value: callStack.length > 0 ? callStack.join(" → ") : "(empty)" },
      ],
      note: {
        vi: `graph[${airport}] đã rỗng (hết cạnh). Thêm "${airport}" vào result theo thứ tự post-order. Quay về hàm gọi trước.`,
        en: `graph[${airport}] is empty (all edges used). Append "${airport}" to result in post-order. Return to caller.`,
      },
    });
  }

  dfs("JFK");

  const answer = [...result].reverse();

  steps.push({
    title: { vi: `Kết quả: ${answer.join(" → ")}`, en: `Result: ${answer.join(" → ")}` },
    arr: [],
    graph: {
      nodes: allAirports.map((a) => ({
        id: a,
        label: a,
        dist: answer.indexOf(a) >= 0 ? String(answer.indexOf(a) + 1) : "",
      })),
      edges: tickets.map(([s, d]) => ({ u: s, v: d })),
      hlNodes: answer,
      hlEdges: answer.slice(0, -1).map((a, i) => [a, answer[i + 1]]),
      visitedNodes: allAirports,
    },
    highlight: [],
    mark: [],
    final: true,
    codeLines: [14],
    vars: [
      { name: "result (before reverse)", value: `[${result.join(", ")}]` },
      { name: "answer", value: answer.join(" → ") },
    ],
    note: {
      vi:
        `Đảo ngược result để có hành trình đúng thứ tự.\n` +
        `Hành trình: ${answer.join(" → ")}.\n` +
        `Mỗi con số trên node là vị trí trong hành trình.`,
      en:
        `Reverse result to get the final itinerary.\n` +
        `Itinerary: ${answer.join(" → ")}.\n` +
        `Each number on a node is its position in the itinerary.`,
    },
  });

  return { tickets: raw, answer, steps };
}

/**
 * LeetCode 332 — Approach 2: Priority Queue (min-heap per node).
 * Instead of sorting in reverse + pop(), we push each destination into a
 * min-heap so heappop() always gives the lex-smallest next airport.
 *
 * Code lines (1-indexed):
 *  1  import heapq
 *  2  from collections import defaultdict
 *  3  class Solution:
 *  4      def findItinerary(self, tickets):
 *  5          graph = defaultdict(list)
 *  6          for src, dst in tickets:
 *  7              heapq.heappush(graph[src], dst)
 *  8          result = []
 *  9          def dfs(airport):
 * 10              while graph[airport]:
 * 11                  next_dest = heapq.heappop(graph[airport])
 * 12                  dfs(next_dest)
 * 13              result.append(airport)
 * 14          dfs("JFK")
 * 15          return result[::-1]
 */
function buildSteps332Approach2(input) {
  const raw = String(input).split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const tickets = raw.map((pair) => {
    const parts = pair.split("-").map((s) => s.trim());
    return [parts[0], parts[1]];
  });

  const steps = [];

  if (tickets.length === 0 || tickets.some(([s, d]) => !s || !d || s === d)) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], final: true, codeBlock: 2, codeLines: [4],
      vars: [{ name: "tickets", value: "[]" }],
      note: {
        vi: "Nhập các vé dạng SRC-DST, ngăn bởi dấu phẩy. Ví dụ: JFK-MUC,MUC-LHR,LHR-SFO,SFO-SJC",
        en: "Enter tickets as SRC-DST separated by commas. Example: JFK-MUC,MUC-LHR,LHR-SFO,SFO-SJC",
      },
    });
    return { tickets: raw, answer: [], steps };
  }

  const allAirports = [...new Set(tickets.flatMap(([s, d]) => [s, d]))].sort();

  // Min-heap per airport (JS array sorted ascending = smallest at index 0)
  const graph = {};
  allAirports.forEach((a) => { graph[a] = []; });

  // Min-heap helpers
  function heapPush(heap, val) {
    heap.push(val);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }
  function heapPop(heap) {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (true) {
        let smallest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
        if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return top;
  }

  // Helper: current graph edges for display
  const graphEdgesFromGraph = () => {
    const edgeList = [];
    for (const [src, dsts] of Object.entries(graph)) {
      for (const dst of dsts) {
        edgeList.push({ u: src, v: dst });
      }
    }
    return edgeList;
  };

  const heapStr = (h) => `[${[...h].sort().join(", ")}]`;
  const graphStr = () =>
    Object.entries(graph)
      .filter(([, v]) => v.length > 0)
      .map(([k, v]) => `${k}: ${heapStr(v)}`)
      .join(", ");

  // ── Step: initialize ──
  steps.push({
    title: { vi: "Khởi tạo graph (min-heap mỗi node)", en: "Initialize graph (min-heap per node)" },
    arr: [],
    graph: {
      nodes: allAirports.map((a) => ({ id: a, label: a, dist: "" })),
      edges: [],
      hlNodes: [],
      hlEdges: [],
      visitedNodes: [],
    },
    highlight: [], mark: [],
    codeBlock: 2,
    codeLines: [5, 6, 7],
    vars: [{ name: "tickets", value: `[${tickets.map(([s, d]) => `(${s},${d})`).join(", ")}]` }],
    note: {
      vi:
        "Với mỗi vé (src, dst), gọi heapq.heappush(graph[src], dst).\n" +
        "Min-heap đảm bảo heappop() luôn trả điểm đến nhỏ nhất theo thứ tự từ điển — không cần sort ngược như Cách 1.",
      en:
        "For each ticket (src, dst) call heapq.heappush(graph[src], dst).\n" +
        "The min-heap guarantees heappop() always returns the lex-smallest destination — no reverse sort needed.",
    },
  });

  // ── Push each ticket into its heap ──
  for (const [src, dst] of tickets) {
    heapPush(graph[src], dst);
    steps.push({
      title: { vi: `heappush(graph[${src}], "${dst}")`, en: `heappush(graph[${src}], "${dst}")` },
      arr: [],
      graph: {
        nodes: allAirports.map((a) => ({ id: a, label: a, dist: "" })),
        edges: graphEdgesFromGraph(),
        hlNodes: [src, dst],
        hlEdges: [[src, dst]],
        visitedNodes: [],
      },
      highlight: [], mark: [],
      codeBlock: 2,
      codeLines: [6, 7],
      vars: [
        { name: "src", value: src },
        { name: "dst", value: dst },
        { name: `graph[${src}] (heap)`, value: heapStr(graph[src]) },
        { name: "graph", value: `{${graphStr()}}` },
      ],
      note: {
        vi: `Đẩy "${dst}" vào min-heap của ${src}. Heap tự sắp xếp để phần tử nhỏ nhất luôn ở đầu.`,
        en: `Push "${dst}" into ${src}'s min-heap. The heap self-orders so the smallest element is always at the front.`,
      },
    });
  }

  // ── All heaps loaded ──
  steps.push({
    title: { vi: "Graph (min-heap) đã xây xong — bắt đầu DFS từ JFK", en: "Graph (min-heap) built — start DFS from JFK" },
    arr: [],
    graph: {
      nodes: allAirports.map((a) => ({ id: a, label: a, dist: "" })),
      edges: graphEdgesFromGraph(),
      hlNodes: ["JFK"],
      hlEdges: [],
      visitedNodes: [],
    },
    highlight: [], mark: [],
    codeBlock: 2,
    codeLines: [8, 14],
    vars: [
      { name: "graph", value: `{${graphStr()}}` },
      { name: "result", value: "[]" },
      { name: "start", value: "JFK" },
    ],
    note: {
      vi:
        "result = []; gọi dfs('JFK').\n" +
        "Mỗi node lưu min-heap — heappop() luôn lấy đích nhỏ nhất theo thứ tự từ điển.\n" +
        "Sau khi DFS hết, đảo ngược result là xong.",
      en:
        "result = []; call dfs('JFK').\n" +
        "Each node has a min-heap — heappop() always picks the lex-smallest destination.\n" +
        "Reverse result at the end.",
    },
  });

  // ── DFS ──
  const result = [];
  const visited = new Set();
  const callStack = [];

  function dfs(airport) {
    callStack.push(airport);
    const stackStr = callStack.join(" → ");

    steps.push({
      title: { vi: `dfs(${airport}) gọi`, en: `dfs(${airport}) called` },
      arr: [],
      graph: {
        nodes: allAirports.map((a) => ({
          id: a,
          label: a,
          dist: result.includes(a) ? "✓" : "",
        })),
        edges: graphEdgesFromGraph(),
        hlNodes: [airport],
        hlEdges: [],
        visitedNodes: [...visited],
      },
      highlight: [], mark: [],
      codeBlock: 2,
      codeLines: [9, 10],
      vars: [
        { name: "airport", value: airport },
        { name: `graph[${airport}] (heap)`, value: heapStr(graph[airport]) },
        { name: "call stack", value: stackStr },
        { name: "result", value: `[${result.join(", ")}]` },
      ],
      note: {
        vi: `Vào dfs(${airport}). Min-heap: ${heapStr(graph[airport])}. Khi còn vé, heappop để lấy điểm nhỏ nhất và đệ quy.`,
        en: `Enter dfs(${airport}). Min-heap: ${heapStr(graph[airport])}. While tickets exist, heappop the smallest dest and recurse.`,
      },
    });

    while (graph[airport].length > 0) {
      const next = heapPop(graph[airport]);

      steps.push({
        title: { vi: `heappop(graph[${airport}]) = ${next} → dfs(${next})`, en: `heappop(graph[${airport}]) = ${next} → dfs(${next})` },
        arr: [],
        graph: {
          nodes: allAirports.map((a) => ({
            id: a,
            label: a,
            dist: result.includes(a) ? "✓" : "",
          })),
          edges: graphEdgesFromGraph(),
          hlNodes: [airport, next],
          hlEdges: [[airport, next]],
          visitedNodes: [...visited],
        },
        highlight: [], mark: [],
        codeBlock: 2,
        codeLines: [11, 12],
        vars: [
          { name: "airport", value: airport },
          { name: "next_dest", value: next },
          { name: `graph[${airport}] after pop`, value: heapStr(graph[airport]) },
          { name: "call stack", value: stackStr + ` → ${next}` },
        ],
        note: {
          vi: `heappop lấy "${next}" — nhỏ nhất hiện có trong heap. Cạnh ${airport} → ${next} được dùng và xóa. Gọi đệ quy dfs(${next}).`,
          en: `heappop returns "${next}" — the current lex-smallest in the heap. Edge ${airport} → ${next} consumed. Recurse into dfs(${next}).`,
        },
      });

      dfs(next);
    }

    result.push(airport);
    visited.add(airport);
    callStack.pop();

    steps.push({
      title: { vi: `graph[${airport}] rỗng → result.append(${airport})`, en: `graph[${airport}] empty → result.append(${airport})` },
      arr: [],
      graph: {
        nodes: allAirports.map((a) => ({
          id: a,
          label: a,
          dist: result.includes(a) ? "✓" : "",
        })),
        edges: graphEdgesFromGraph(),
        hlNodes: [airport],
        hlEdges: [],
        visitedNodes: [...visited],
      },
      highlight: [], mark: [],
      codeBlock: 2,
      codeLines: [10, 13],
      vars: [
        { name: "airport", value: airport },
        { name: "result (before reverse)", value: `[${result.join(", ")}]` },
        { name: "call stack", value: callStack.length > 0 ? callStack.join(" → ") : "(empty)" },
      ],
      note: {
        vi: `Heap của ${airport} đã rỗng (hết cạnh). Append "${airport}" vào result (post-order). Quay về caller.`,
        en: `${airport}'s heap is empty (all edges used). Append "${airport}" to result (post-order). Return to caller.`,
      },
    });
  }

  dfs("JFK");

  const answer = [...result].reverse();

  steps.push({
    title: { vi: `Kết quả: ${answer.join(" → ")}`, en: `Result: ${answer.join(" → ")}` },
    arr: [],
    graph: {
      nodes: allAirports.map((a) => ({
        id: a,
        label: a,
        dist: answer.indexOf(a) >= 0 ? String(answer.indexOf(a) + 1) : "",
      })),
      edges: tickets.map(([s, d]) => ({ u: s, v: d })),
      hlNodes: answer,
      hlEdges: answer.slice(0, -1).map((a, i) => [a, answer[i + 1]]),
      visitedNodes: allAirports,
    },
    highlight: [], mark: [],
    final: true,
    codeBlock: 2,
    codeLines: [15],
    vars: [
      { name: "result (before reverse)", value: `[${result.join(", ")}]` },
      { name: "answer", value: answer.join(" → ") },
    ],
    note: {
      vi:
        `Đảo ngược result để có hành trình đúng thứ tự.\n` +
        `Hành trình: ${answer.join(" → ")}.\n` +
        `Mỗi con số trên node là vị trí trong hành trình.`,
      en:
        `Reverse result to get the final itinerary.\n` +
        `Itinerary: ${answer.join(" → ")}.\n` +
        `Each number on a node is its position in the itinerary.`,
    },
  });

  return { tickets: raw, answer, steps };
}

function buildSteps332(input, params) {
  const approach = Number(params && params.approach) || 1;
  return approach === 2
    ? buildSteps332Approach2(input)
    : buildSteps332Approach1(input);
}

/**
 * LeetCode 1334: Find the City With the Smallest Number of Neighbors at a
 * Threshold Distance.
 *
 * Given n cities (0..n-1) connected by weighted edges, and a distance
 * threshold, find the city that has the SMALLEST number of OTHER cities
 * reachable within `threshold` distance. If tied, return the city with the
 * LARGEST index.
 *
 * Algorithm: Floyd-Warshall computes dist[i][j] = shortest path between
 * every pair of cities in O(n³). Then for each city, count how many other
 * cities have dist[city][other] <= threshold, and pick the city with the
 * fewest such neighbors (largest index breaks ties).
 */
function buildSteps1334(input, params) {
  const edgesRaw = String(input).split(",").map((edge) => edge.trim()).filter(Boolean);
  const n = Number(params.n);
  const threshold = Number(params.threshold);
  const steps = [];

  const edgeList = edgesRaw.map((e) => {
    const parts = e.split("-").map(Number);
    return { u: parts[0], v: parts[1], w: parts[2] };
  });
  const valid = Number.isInteger(n) && n > 0
    && Number.isFinite(threshold) && threshold >= 0
    && edgeList.length > 0
    && edgeList.every(({ u, v, w }) => (
      Number.isInteger(u) && u >= 0 && u < n
      && Number.isInteger(v) && v >= 0 && v < n
      && u !== v && Number.isFinite(w) && w > 0
    ));

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Nhập cạnh theo dạng u-v-w, ngăn cách bằng dấu phẩy. Mỗi thành phố phải nằm trong 0..n-1, trọng số dương.",
        en: "Enter edges as u-v-w separated by commas. Every city must be in 0..n-1, weights must be positive.",
      },
    });
    return { edges: edgesRaw, n, threshold, answer: -1, steps };
  }

  const INF = Infinity;
  const dist = Array.from({ length: n }, () => new Array(n).fill(INF));
  for (let i = 0; i < n; i++) dist[i][i] = 0;
  for (const { u, v, w } of edgeList) {
    dist[u][v] = Math.min(dist[u][v], w);
    dist[v][u] = Math.min(dist[v][u], w);
  }

  function gridDisplay(hlCell) {
    return {
      dp: dist.map((row) => row.map((v) => (v === INF ? "\u221E" : String(v)))),
      text1: Array.from({ length: n }, (_, i) => String(i)),
      text2: Array.from({ length: n }, (_, i) => String(i)),
      hlCell: hlCell || null,
      pathCells: [],
    };
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: gridDisplay(opts.hlCell),
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  const edgesStr = edgeList.map((e) => `(${e.u},${e.v},${e.w})`).join(", ");

  // Line 3: dist = [[inf]*n for _ in range(n)]
  snap({
    title: { vi: "dist = ma trận n×n toàn ∞", en: "dist = n×n matrix, all ∞" },
    codeLines: [3],
    vars: [{ name: "n", value: n }, { name: "threshold", value: threshold }, { name: "edges", value: edgesStr }],
    note: {
      vi: `n=${n} thành phố, threshold=${threshold}. Khởi tạo ma trận dist toàn ∞ — sẽ dùng Floyd-Warshall để tính khoảng cách ngắn nhất giữa MỌI cặp thành phố.`,
      en: `n=${n} cities, threshold=${threshold}. Initialize the dist matrix to all ∞ — will use Floyd-Warshall to compute shortest paths between EVERY pair of cities.`,
    },
  });

  // Line 4: for i in range(n): dist[i][i] = 0
  snap({
    title: { vi: "for i in range(n): dist[i][i] = 0", en: "for i in range(n): dist[i][i] = 0" },
    codeLines: [4],
    note: {
      vi: "Khoảng cách từ 1 thành phố tới chính nó luôn = 0.",
      en: "Distance from a city to itself is always 0.",
    },
  });

  // Line 5-6: for u,v,w in edges: dist[u][v]=dist[v][u]=w
  for (const { u, v, w } of edgeList) {
    snap({
      title: { vi: `dist[${u}][${v}] = dist[${v}][${u}] = ${w}`, en: `dist[${u}][${v}] = dist[${v}][${u}] = ${w}` },
      hlCell: [u, v],
      codeLines: [5, 6],
      vars: [{ name: "edge", value: `(${u},${v},${w})` }],
      note: {
        vi: `Cạnh (${u},${v},${w}) là 2 chiều → gán dist[${u}][${v}] = dist[${v}][${u}] = ${w}.`,
        en: `Edge (${u},${v},${w}) is bidirectional → set dist[${u}][${v}] = dist[${v}][${u}] = ${w}.`,
      },
    });
  }

  // Floyd-Warshall: for k, for i, for j
  for (let k = 0; k < n; k++) {
    // Line 7: for k in range(n):
    snap({
      title: { vi: `for k in range(n) → k=${k}`, en: `for k in range(n) → k=${k}` },
      hlCell: [k, k],
      codeLines: [7],
      vars: [{ name: "k (intermediate)", value: k }],
      note: {
        vi: `Xét k=${k} làm điểm TRUNG GIAN. Kiểm tra: đi từ i đến j qua k có ngắn hơn đường hiện tại không?`,
        en: `Consider k=${k} as the INTERMEDIATE point. Check: does going from i to j through k give a shorter path than the current one?`,
      },
    });

    for (let i = 0; i < n; i++) {
      // Line 8: for i in range(n):
      snap({
        title: { vi: `for i in range(n) → i=${i} (k=${k})`, en: `for i in range(n) → i=${i} (k=${k})` },
        hlCell: [i, k],
        codeLines: [8],
        vars: [{ name: "i", value: i }, { name: "k", value: k }],
        note: {
          vi: `Xét i=${i}. Sẽ thử mọi j để xem đường i→k→j có cải thiện dist[i][j] không.`,
          en: `Consider i=${i}. Will try every j to see if the i→k→j path improves dist[i][j].`,
        },
      });

      for (let j = 0; j < n; j++) {
        const via = dist[i][k] + dist[k][j];
        const improves = via < dist[i][j];

        // Line 9: for j in range(n):
        snap({
          title: { vi: `for j in range(n) → j=${j}`, en: `for j in range(n) → j=${j}` },
          hlCell: [i, j],
          codeLines: [9],
          vars: [{ name: "j", value: j }],
          note: {
            vi: `Xét j=${j}. So sánh dist[${i}][${k}]+dist[${k}][${j}] với dist[${i}][${j}] hiện tại.`,
            en: `Consider j=${j}. Compare dist[${i}][${k}]+dist[${k}][${j}] with the current dist[${i}][${j}].`,
          },
        });

        // Line 10: if dist[i][k] + dist[k][j] < dist[i][j]:
        snap({
          title: { vi: `if dist[i][k]+dist[k][j] < dist[i][j] → ${fmtD(via)} < ${fmtD(dist[i][j])} → ${improves}`, en: `if dist[i][k]+dist[k][j] < dist[i][j] → ${fmtD(via)} < ${fmtD(dist[i][j])} → ${improves}` },
          hlCell: [i, j],
          codeLines: [10],
          vars: [{ name: "via k", value: fmtD(via) }, { name: "dist[i][j]", value: fmtD(dist[i][j]) }],
          note: improves
            ? { vi: `Đi qua k=${k} NGẮN HƠN: ${fmtD(via)} < ${fmtD(dist[i][j])} → sẽ cập nhật dist[${i}][${j}].`, en: `Going through k=${k} is SHORTER: ${fmtD(via)} < ${fmtD(dist[i][j])} → will update dist[${i}][${j}].` }
            : { vi: `Đi qua k=${k} không ngắn hơn → giữ nguyên dist[${i}][${j}] = ${fmtD(dist[i][j])}.`, en: `Going through k=${k} isn't shorter → keep dist[${i}][${j}] = ${fmtD(dist[i][j])}.` },
        });

        if (improves) {
          // Line 11: dist[i][j] = dist[i][k] + dist[k][j]
          dist[i][j] = via;
          snap({
            title: { vi: `dist[${i}][${j}] = ${via}`, en: `dist[${i}][${j}] = ${via}` },
            hlCell: [i, j],
            codeLines: [11],
            vars: [{ name: `dist[${i}][${j}]`, value: via }],
            note: {
              vi: `Cập nhật dist[${i}][${j}] = ${via} (đi qua k=${k}).`,
              en: `Update dist[${i}][${j}] = ${via} (via k=${k}).`,
            },
          });
        }
      }
    }
  }

  // Count neighbors within threshold for each city.
  const counts = dist.map((row, i) => row.filter((d, j) => j !== i && d <= threshold).length);

  // Line 12: best = min(range(n), key=lambda i: (count[i], -i))
  let best = 0;
  for (let i = 1; i < n; i++) {
    if (counts[i] <= counts[best]) best = i;
  }

  const countsStr = counts.map((c, i) => `city ${i}: ${c}`).join(", ");
  snap({
    title: { vi: `Đếm số láng giềng ≤ threshold cho mỗi thành phố`, en: `Count neighbors ≤ threshold for each city` },
    codeLines: [12, 13],
    vars: [{ name: "counts", value: countsStr }],
    note: {
      vi: `Với mỗi thành phố i, đếm số j≠i có dist[i][j] ≤ ${threshold}. Kết quả: ${countsStr}.`,
      en: `For each city i, count j≠i where dist[i][j] ≤ ${threshold}. Result: ${countsStr}.`,
    },
  });

  const fs = {
    title: { vi: `Kết quả: thành phố ${best} (${counts[best]} láng giềng)`, en: `Result: city ${best} (${counts[best]} neighbors)` },
    arr: [],
    grid: gridDisplay([best, best]),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [14],
    vars: [{ name: "answer", value: best }, { name: "counts", value: countsStr }],
    note: {
      vi: `Thành phố ${best} có ÍT nhất láng giềng trong ngưỡng ${threshold} (${counts[best]} láng giềng). Nếu có nhiều thành phố hòa, chọn INDEX LỚN NHẤT.`,
      en: `City ${best} has the FEWEST neighbors within threshold ${threshold} (${counts[best]} neighbors). Ties are broken by picking the LARGEST index.`,
    },
  };
  steps.push(fs);

  return { edges: edgesRaw, n, threshold, answer: best, steps };
}

function fmtD(v) {
  return v === Infinity ? "\u221E" : String(v);
}

/**
 * LeetCode 1334 Approach 2: Dijkstra from every city.
 *
 * Instead of Floyd-Warshall O(n³), run Dijkstra's algorithm N times — once
 * per source city — each in O(n² ) with a simple array-based "find min"
 * (no heap needed since n is small in this problem). Total: O(n³) worst
 * case too, but in practice much faster on sparse graphs since Dijkstra
 * only explores actual edges instead of blindly trying every (i,k,j) triple.
 * Same final answer as Floyd-Warshall — just a different way to fill the
 * same dist[][] matrix, one ROW at a time instead of all at once.
 */
function buildSteps1334Dijkstra(input, params) {
  const edgesRaw = String(input).split(",").map((edge) => edge.trim()).filter(Boolean);
  const n = Number(params.n);
  const threshold = Number(params.threshold);
  const steps = [];

  const edgeList = edgesRaw.map((e) => {
    const parts = e.split("-").map(Number);
    return { u: parts[0], v: parts[1], w: parts[2] };
  });
  const valid = Number.isInteger(n) && n > 0
    && Number.isFinite(threshold) && threshold >= 0
    && edgeList.length > 0
    && edgeList.every(({ u, v, w }) => (
      Number.isInteger(u) && u >= 0 && u < n
      && Number.isInteger(v) && v >= 0 && v < n
      && u !== v && Number.isFinite(w) && w > 0
    ));

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeBlock: 2,
      codeLines: [3],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Nhập cạnh theo dạng u-v-w, ngăn cách bằng dấu phẩy. Mỗi thành phố phải nằm trong 0..n-1, trọng số dương.",
        en: "Enter edges as u-v-w separated by commas. Every city must be in 0..n-1, weights must be positive.",
      },
    });
    return { edges: edgesRaw, n, threshold, answer: -1, steps };
  }

  const INF = Infinity;
  const adj = Array.from({ length: n }, () => []);
  const dist = Array.from({ length: n }, () => new Array(n).fill(INF));
  for (let i = 0; i < n; i++) dist[i][i] = 0;

  function gridDisplay(hlCell) {
    return {
      dp: dist.map((row) => row.map((v) => (v === INF ? "\u221E" : String(v)))),
      text1: Array.from({ length: n }, (_, i) => String(i)),
      text2: Array.from({ length: n }, (_, i) => String(i)),
      hlCell: hlCell || null,
      pathCells: [],
    };
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: gridDisplay(opts.hlCell),
      graph: opts.graph,
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeBlock: 2,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  const edgesStr = edgeList.map((e) => `(${e.u},${e.v},${e.w})`).join(", ");
  const allEdgesForGraph = edgeList.map((e) => ({ u: e.u, v: e.v, w: e.w }));
  const graphNodes = Array.from({ length: n }, (_, id) => ({ id, label: String(id) }));

  function makeGraph(hlNodes, hlEdges, visitedNodes) {
    return {
      nodes: graphNodes,
      edges: allEdgesForGraph,
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: visitedNodes || [],
    };
  }

  // Line 3: dist = [[inf]*n for _ in range(n)]
  snap({
    title: { vi: "dist = ma trận n×n toàn ∞", en: "dist = n×n matrix, all ∞" },
    codeLines: [3],
    graph: makeGraph([], []),
    vars: [{ name: "n", value: n }, { name: "threshold", value: threshold }, { name: "edges", value: edgesStr }],
    note: {
      vi: `n=${n} thành phố, threshold=${threshold}. Thay vì Floyd-Warshall, sẽ chạy Dijkstra ${n} LẦN — mỗi lần từ 1 thành phố nguồn — để lấp đầy ma trận dist theo từng HÀNG.`,
      en: `n=${n} cities, threshold=${threshold}. Instead of Floyd-Warshall, will run Dijkstra ${n} TIMES — once per source city — filling the dist matrix one ROW at a time.`,
    },
  });

  // Line 4: adj = [[] for _ in range(n)]
  snap({
    title: { vi: "adj = [[] for _ in range(n)]", en: "adj = [[] for _ in range(n)]" },
    codeLines: [4],
    graph: makeGraph([], []),
    note: {
      vi: "Khởi tạo adjacency list rỗng cho mỗi thành phố — sẽ xây dựng bằng cách đọc từng cạnh trong edges.",
      en: "Initialize an empty adjacency list for every city — will build it by reading each edge in edges.",
    },
  });

  for (const { u, v, w } of edgeList) {
    // Line 5: for u, v, w in edges:
    snap({
      title: { vi: `for u,v,w in edges → (${u},${v},${w})`, en: `for u,v,w in edges → (${u},${v},${w})` },
      hlCell: [u, v],
      graph: makeGraph([u, v], [[u, v]]),
      codeLines: [5],
      vars: [{ name: "u,v,w", value: `${u},${v},${w}` }],
      note: {
        vi: `Đọc cạnh tiếp theo (${u},${v},${w}) từ danh sách edges.`,
        en: `Read the next edge (${u},${v},${w}) from the edges list.`,
      },
    });

    // Line 6: adj[u].append((v, w))
    adj[u].push([v, w]);
    snap({
      title: { vi: `adj[${u}].append((${v}, ${w}))`, en: `adj[${u}].append((${v}, ${w}))` },
      hlCell: [u, v],
      graph: makeGraph([u, v], [[u, v]]),
      codeLines: [6],
      vars: [{ name: `adj[${u}]`, value: `[${adj[u].map(([to, weight]) => `(${to},${weight})`).join(",")}]` }],
      note: {
        vi: `Thêm hàng xóm (${v}, ${w}) vào adj[${u}] — từ ${u} có thể đi tới ${v} với chi phí ${w}.`,
        en: `Add neighbor (${v}, ${w}) to adj[${u}] — from ${u} you can reach ${v} with cost ${w}.`,
      },
    });

    // Line 7: adj[v].append((u, w))
    adj[v].push([u, w]);
    snap({
      title: { vi: `adj[${v}].append((${u}, ${w}))`, en: `adj[${v}].append((${u}, ${w}))` },
      hlCell: [u, v],
      graph: makeGraph([u, v], [[u, v]]),
      codeLines: [7],
      vars: [{ name: `adj[${v}]`, value: `[${adj[v].map(([to, weight]) => `(${to},${weight})`).join(",")}]` }],
      note: {
        vi: `Cạnh 2 chiều nên cũng thêm (${u}, ${w}) vào adj[${v}] — từ ${v} có thể đi ngược lại tới ${u}.`,
        en: `Since the edge is bidirectional, also add (${u}, ${w}) to adj[${v}] — from ${v} you can go back to ${u}.`,
      },
    });
  }

  for (let src = 0; src < n; src++) {
    // Line 8: for src in range(n):
    snap({
      title: { vi: `for src in range(n) → src=${src}`, en: `for src in range(n) → src=${src}` },
      hlCell: [src, src],
      graph: makeGraph([src], []),
      codeLines: [8],
      vars: [{ name: "src", value: src }],
      note: {
        vi: `Chạy Dijkstra từ nguồn src=${src} để lấp đầy hàng dist[${src}][*].`,
        en: `Run Dijkstra from source src=${src} to fill row dist[${src}][*].`,
      },
    });

    // Line 9: dist[src][src] = 0
    dist[src][src] = 0;
    snap({
      title: { vi: `dist[${src}][${src}] = 0`, en: `dist[${src}][${src}] = 0` },
      hlCell: [src, src],
      graph: makeGraph([src], [], []),
      codeLines: [9],
      vars: [{ name: `dist[${src}][${src}]`, value: 0 }],
      note: {
        vi: `Khoảng cách từ ${src} tới chính nó = 0.`,
        en: `Distance from ${src} to itself is 0.`,
      },
    });

    // Line 10: visited = [False] * n
    const visited = new Array(n).fill(false);
    snap({
      title: { vi: "visited = [False] * n", en: "visited = [False] * n" },
      hlCell: [src, src],
      graph: makeGraph([src], [], []),
      codeLines: [10],
      note: {
        vi: `Khởi tạo visited toàn False cho lần chạy Dijkstra từ src=${src}.`,
        en: `Initialize visited to all False for this Dijkstra run from src=${src}.`,
      },
    });

    for (let iter = 0; iter < n; iter++) {
      // Line 11: while True:
      snap({
        title: { vi: "while True:", en: "while True:" },
        hlCell: [src, src],
        graph: makeGraph([], [], [...Array(n).keys()].filter((x) => visited[x])),
        codeLines: [11],
        note: {
          vi: "Lặp mãi cho tới khi hết thành phố chưa thăm có thể đến được (thoát bằng break bên trong).",
          en: "Loop forever until there's no more reachable unvisited city (exits via break inside).",
        },
      });

      // Line 12: u = min(...)
      let u = -1;
      let best = INF;
      for (let cand = 0; cand < n; cand++) {
        if (!visited[cand] && dist[src][cand] < best) { best = dist[src][cand]; u = cand; }
      }
      snap({
        title: { vi: `u = min(chưa thăm, key=dist[src][c]) → u=${u === -1 ? "none" : u} (${fmtD(best)})`, en: `u = min(unvisited, key=dist[src][c]) → u=${u === -1 ? "none" : u} (${fmtD(best)})` },
        hlCell: u >= 0 ? [src, u] : null,
        graph: makeGraph(u >= 0 ? [u] : [], [], [...Array(n).keys()].filter((x) => visited[x])),
        codeLines: [12],
        vars: [{ name: "u", value: u === -1 ? "None" : u }, { name: "dist[src][u]", value: fmtD(best) }],
        note: {
          vi: `Tìm thành phố CHƯA THĂM có dist[src][c] nhỏ nhất → u=${u === -1 ? "None" : u}.`,
          en: `Find the UNVISITED city with the smallest dist[src][c] → u=${u === -1 ? "None" : u}.`,
        },
      });

      // Line 13-14: if u == -1 or dist[src][u] == inf: break
      const shouldBreak = u === -1 || best === INF;
      snap({
        title: { vi: `if u==-1 or dist[src][u]==∞ → ${shouldBreak}`, en: `if u==-1 or dist[src][u]==∞ → ${shouldBreak}` },
        hlCell: u >= 0 ? [src, u] : null,
        graph: makeGraph(u >= 0 ? [u] : [], [], [...Array(n).keys()].filter((x) => visited[x])),
        codeLines: [13],
        note: shouldBreak
          ? { vi: "Không còn thành phố chưa thăm nào có thể đến được → sẽ break, dừng Dijkstra cho nguồn này.", en: "No reachable unvisited city remains → will break, stopping Dijkstra for this source." }
          : { vi: `u=${u} vẫn đến được (dist=${fmtD(best)}) → tiếp tục xử lý, không break.`, en: `u=${u} is still reachable (dist=${fmtD(best)}) → continue processing, no break.` },
      });

      if (shouldBreak) {
        snap({
          title: { vi: "break", en: "break" },
          graph: makeGraph([], [], [...Array(n).keys()].filter((x) => visited[x])),
          codeLines: [14],
          note: {
            vi: "Thoát vòng while — đã xử lý xong mọi thành phố đến được từ src.",
            en: "Exit the while loop — every reachable city from src has been processed.",
          },
        });
        break;
      }

      // Line 15: visited[u] = True
      visited[u] = true;
      snap({
        title: { vi: `visited[${u}] = True`, en: `visited[${u}] = True` },
        hlCell: [src, u],
        graph: makeGraph([u], [], [...Array(n).keys()].filter((x) => visited[x])),
        codeLines: [15],
        note: {
          vi: `Đánh dấu ${u} đã thăm — dist[${src}][${u}]=${fmtD(dist[src][u])} đã CHỐT, không thể tốt hơn nữa.`,
          en: `Mark ${u} as visited — dist[${src}][${u}]=${fmtD(dist[src][u])} is now FINAL, cannot improve further.`,
        },
      });

      for (const [v, w] of adj[u]) {
        // Line 16: for v, w in adj[u]:
        snap({
          title: { vi: `for v,w in adj[${u}] → v=${v}, w=${w}`, en: `for v,w in adj[${u}] → v=${v}, w=${w}` },
          hlCell: [src, v],
          graph: makeGraph([u, v], [[u, v]], [...Array(n).keys()].filter((x) => visited[x])),
          codeLines: [16],
          vars: [{ name: "v", value: v }, { name: "w", value: w }],
          note: {
            vi: `Xét hàng xóm v=${v} của u=${u}, cạnh nặng w=${w}.`,
            en: `Consider neighbor v=${v} of u=${u}, edge weight w=${w}.`,
          },
        });

        const via = dist[src][u] + w;
        const improves = via < dist[src][v];

        // Line 17: if dist[src][u] + w < dist[src][v]:
        snap({
          title: { vi: `if dist[src][u]+w < dist[src][v] → ${fmtD(via)} < ${fmtD(dist[src][v])} → ${improves}`, en: `if dist[src][u]+w < dist[src][v] → ${fmtD(via)} < ${fmtD(dist[src][v])} → ${improves}` },
          hlCell: [src, v],
          graph: makeGraph([u, v], [[u, v]], [...Array(n).keys()].filter((x) => visited[x])),
          codeLines: [17],
          vars: [{ name: "via u", value: fmtD(via) }, { name: `dist[src][${v}]`, value: fmtD(dist[src][v]) }],
          note: improves
            ? { vi: `Đi qua u=${u} NGẮN HƠN: ${fmtD(via)} < ${fmtD(dist[src][v])} → cập nhật dist[${src}][${v}].`, en: `Going through u=${u} is SHORTER: ${fmtD(via)} < ${fmtD(dist[src][v])} → update dist[${src}][${v}].` }
            : { vi: `Không cải thiện → giữ nguyên dist[${src}][${v}] = ${fmtD(dist[src][v])}.`, en: `No improvement → keep dist[${src}][${v}] = ${fmtD(dist[src][v])}.` },
        });

        if (improves) {
          // Line 18: dist[src][v] = dist[src][u] + w
          dist[src][v] = via;
          snap({
            title: { vi: `dist[${src}][${v}] = ${via}`, en: `dist[${src}][${v}] = ${via}` },
            hlCell: [src, v],
            graph: makeGraph([u, v], [[u, v]], [...Array(n).keys()].filter((x) => visited[x])),
            codeLines: [18],
            vars: [{ name: `dist[${src}][${v}]`, value: via }],
            note: {
              vi: `Cập nhật dist[${src}][${v}] = ${via} (đi qua ${u}).`,
              en: `Update dist[${src}][${v}] = ${via} (via ${u}).`,
            },
          });
        }
      }
    }
  }

  // Count neighbors within threshold for each city.
  const counts = dist.map((row, i) => row.filter((d, j) => j !== i && d <= threshold).length);

  let best = 0;
  for (let i = 1; i < n; i++) {
    if (counts[i] <= counts[best]) best = i;
  }

  const countsStr = counts.map((c, i) => `city ${i}: ${c}`).join(", ");
  // Line 19: counts = [...]
  snap({
    title: { vi: `Đếm số láng giềng ≤ threshold cho mỗi thành phố`, en: `Count neighbors ≤ threshold for each city` },
    codeLines: [19],
    graph: makeGraph([], []),
    vars: [{ name: "counts", value: countsStr }],
    note: {
      vi: `Với mỗi thành phố i, đếm số j≠i có dist[i][j] ≤ ${threshold}. Kết quả: ${countsStr}.`,
      en: `For each city i, count j≠i where dist[i][j] ≤ ${threshold}. Result: ${countsStr}.`,
    },
  });

  // Lines 20-23: best = 0; for i in range(1,n): if counts[i]<=counts[best]: best=i
  snap({
    title: { vi: `best = argmin(counts) (hòa → index lớn hơn) → ${best}`, en: `best = argmin(counts) (ties → larger index) → ${best}` },
    codeLines: [20, 21, 22, 23],
    graph: makeGraph([best], []),
    vars: [{ name: "best", value: best }],
    note: {
      vi: `Duyệt counts từ i=1, mỗi khi gặp counts[i] ≤ counts[best] thì cập nhật best=i (dùng ≤ để ưu tiên index lớn hơn khi hòa) → best=${best}.`,
      en: `Scan counts from i=1, whenever counts[i] ≤ counts[best] update best=i (using ≤ favors the larger index on ties) → best=${best}.`,
    },
  });

  const fs = {
    title: { vi: `return best → ${best}`, en: `return best → ${best}` },
    arr: [],
    grid: gridDisplay([best, best]),
    graph: makeGraph([best], []),
    highlight: [],
    mark: [],
    final: true,
    codeBlock: 2,
    codeLines: [24],
    vars: [{ name: "answer", value: best }, { name: "counts", value: countsStr }],
    note: {
      vi: `Thành phố ${best} có ÍT nhất láng giềng trong ngưỡng ${threshold} (${counts[best]} láng giềng). Kết quả GIỐNG Floyd-Warshall — chỉ khác cách lấp đầy ma trận dist.`,
      en: `City ${best} has the FEWEST neighbors within threshold ${threshold} (${counts[best]} neighbors). SAME result as Floyd-Warshall — just a different way to fill the dist matrix.`,
    },
  };
  steps.push(fs);

  return { edges: edgesRaw, n, threshold, answer: best, steps };
}

/**
 * LeetCode 505: The Maze II.
 *
 * A ball in a maze rolls in one direction (up/down/left/right) until it
 * hits a wall or the boundary — it does NOT stop at every empty cell along
 * the way. Find the shortest distance (number of empty cells traveled) for
 * the ball to STOP exactly at the destination. Return -1 if impossible.
 *
 * Since each "roll" (edge) has a different cost (the number of cells rolled
 * through), this is NOT plain BFS — it's Dijkstra's algorithm on the graph
 * where nodes are STOPPING positions and edges are full rolls in one of the
 * 4 directions.
 */
function buildSteps505(input, params) {
  const grid = parseIslandGrid(input).map((row) => row.map((v) => Number(v)));
  const steps = [];

  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const validGrid = rows > 0 && cols > 0 && grid.every((row) => row.length === cols && row.every((v) => v === 0 || v === 1));

  const startR = Number(params.startR);
  const startC = Number(params.startC);
  const destR = Number(params.destR);
  const destC = Number(params.destC);

  const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;
  const validPositions = validGrid
    && inBounds(startR, startC) && grid[startR][startC] === 0
    && inBounds(destR, destC) && grid[destR][destC] === 0;

  if (!validGrid || !validPositions) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid chỉ gồm 0 (trống)/1 (tường); start và destination phải là ô trống hợp lệ trong grid.",
        en: "Grid must contain only 0 (empty)/1 (wall); start and destination must be valid empty cells within the grid.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  const INF = Infinity;
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(INF));
  const parent = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const key = (r, c) => `${r},${c}`;
  const dirs = [[-1, 0, "up"], [1, 0, "down"], [0, -1, "left"], [0, 1, "right"]];

  function makeCells(current, rollPath, queuedSet) {
    const rollSet = new Set((rollPath || []).map(([r, c]) => key(r, c)));
    return grid.map((row, r) =>
      row.map((cell, c) => {
        const cellKey = key(r, c);
        let cls = "empty";
        let label = ".";
        if (cell === 1) { cls = "wall"; label = "X"; }
        else if (r === startR && c === startC) { cls = "start"; label = "*"; }
        else if (r === destR && c === destC) { cls = "end"; label = "#"; }
        if (dist[r][c] < INF && cell === 0 && !(r === startR && c === startC)) { cls = "visited"; label = String(dist[r][c]); }
        if (rollSet.has(cellKey)) cls = "queued";
        if (queuedSet && queuedSet.has(cellKey) && cell === 0) cls = "queued";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current, rollPath, queuedSet, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(current, rollPath, queuedSet) },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Khởi tạo Dijkstra", en: "Initialize Dijkstra" },
    current: [startR, startC],
    codeLines: [3, 4, 5],
    vars: [
      { name: "start", value: `(${startR}, ${startC})` },
      { name: "destination", value: `(${destR}, ${destC})` },
    ],
    note: {
      vi: `Bóng CHỈ dừng khi va tường hoặc ra biên — không dừng ở mọi ô trống. Vì mỗi "lăn" (cạnh) có chi phí khác nhau (số ô đi qua), dùng DIJKSTRA (không phải BFS thường) trên đồ thị: nút = vị trí DỪNG, cạnh = 1 lần lăn theo 1 trong 4 hướng.`,
      en: `The ball only stops when it hits a wall or the boundary — not at every empty cell. Since each "roll" (edge) has a different cost (cells traveled), use DIJKSTRA (not plain BFS) on a graph where nodes = STOPPING positions, edges = one roll in one of the 4 directions.`,
    },
  });

  dist[startR][startC] = 0;
  visited[startR][startC] = false; // will be marked visited when popped
  // Priority queue simulated as an array, sorted before each pop (grids are small).
  let queue = [[0, startR, startC]];

  pushStep({
    title: { vi: `Đưa start (${startR},${startC}) vào priority queue với dist=0`, en: `Push start (${startR},${startC}) into the priority queue with dist=0` },
    current: [startR, startC],
    codeLines: [4, 5],
    vars: [{ name: "queue", value: `[(0, ${startR}, ${startC})]` }],
    note: {
      vi: "dist[start] = 0 vì chưa lăn bước nào.",
      en: "dist[start] = 0 since no rolling has happened yet.",
    },
  });

  let found = false;
  let iterGuard = 0;

  while (queue.length && !found && iterGuard < 500) {
    iterGuard++;
    queue.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = queue.shift();

    const stale = d > dist[r][c] || visited[r][c];
    pushStep({
      title: stale
        ? { vi: `Pop (d=${d}, ${r},${c}) → bản ghi CŨ, bỏ qua`, en: `Pop (d=${d}, ${r},${c}) → STALE entry, skip` }
        : { vi: `Pop (d=${d}, ${r},${c}) → xử lý`, en: `Pop (d=${d}, ${r},${c}) → process` },
      current: [r, c],
      codeLines: [6, 7],
      vars: [{ name: "d", value: d }, { name: "(r,c)", value: `(${r},${c})` }, { name: `dist[${r}][${c}]`, value: fmtD(dist[r][c]) }],
      note: stale
        ? { vi: `Đã có đường tốt hơn hoặc đã thăm (${r},${c}) trước đó → bỏ qua bản ghi cũ này.`, en: `A better route to (${r},${c}) was already found or it's already visited → skip this stale entry.` }
        : { vi: `(${r},${c}) chưa thăm và d=${d} là khoảng cách tốt nhất hiện tại → mở rộng từ đây.`, en: `(${r},${c}) is unvisited and d=${d} is the current best distance → expand from here.` },
    });

    if (stale) continue;
    visited[r][c] = true;

    if (r === destR && c === destC) {
      found = true;
      break;
    }

    for (const [dr, dc, dirName] of dirs) {
      // Roll in this direction until hitting a wall or the boundary.
      let nr = r, nc = c, steps_ = 0;
      const rollPath = [[r, c]];
      while (inBounds(nr + dr, nc + dc) && grid[nr + dr][nc + dc] === 0) {
        nr += dr; nc += dc; steps_++;
        rollPath.push([nr, nc]);
      }

      pushStep({
        title: { vi: `Lăn hướng ${dirName} từ (${r},${c}) → dừng tại (${nr},${nc}), ${steps_} bước`, en: `Roll ${dirName} from (${r},${c}) → stops at (${nr},${nc}), ${steps_} steps` },
        current: [r, c],
        rollPath,
        codeLines: [8, 9, 10, 11],
        vars: [{ name: "direction", value: dirName }, { name: "stop at", value: `(${nr},${nc})` }, { name: "steps rolled", value: steps_ }],
        note: steps_ === 0
          ? { vi: `Hướng ${dirName} bị chặn ngay (tường/biên sát cạnh) → không di chuyển được.`, en: `Direction ${dirName} is blocked immediately (wall/boundary right next to it) → can't move.` }
          : { vi: `Bóng lăn liên tục theo hướng ${dirName} qua ${steps_} ô trống, dừng lại tại (${nr},${nc}) vì gặp tường/biên.`, en: `The ball keeps rolling ${dirName} through ${steps_} empty cells, stopping at (${nr},${nc}) because of a wall/boundary.` },
      });

      if (steps_ === 0) continue;

      const newDist = d + steps_;
      const improves = newDist < dist[nr][nc];

      pushStep({
        title: { vi: `if newDist < dist[${nr}][${nc}] → ${newDist} < ${fmtD(dist[nr][nc])} → ${improves}`, en: `if newDist < dist[${nr}][${nc}] → ${newDist} < ${fmtD(dist[nr][nc])} → ${improves}` },
        current: [nr, nc],
        codeLines: [12],
        vars: [{ name: "newDist", value: newDist }, { name: `dist[${nr}][${nc}]`, value: fmtD(dist[nr][nc]) }],
        note: improves
          ? { vi: `${newDist} < ${fmtD(dist[nr][nc])} → tìm được đường ngắn hơn tới (${nr},${nc}), cập nhật và đưa vào queue.`, en: `${newDist} < ${fmtD(dist[nr][nc])} → found a shorter route to (${nr},${nc}), update and push into the queue.` }
          : { vi: `Không cải thiện → giữ nguyên dist[${nr}][${nc}] = ${fmtD(dist[nr][nc])}.`, en: `No improvement → keep dist[${nr}][${nc}] = ${fmtD(dist[nr][nc])}.` },
      });

      if (improves) {
        dist[nr][nc] = newDist;
        parent[nr][nc] = [r, c];
        queue.push([newDist, nr, nc]);
        pushStep({
          title: { vi: `dist[${nr}][${nc}] = ${newDist}; push vào queue`, en: `dist[${nr}][${nc}] = ${newDist}; push into queue` },
          current: [nr, nc],
          codeLines: [13, 14],
          vars: [{ name: `dist[${nr}][${nc}]`, value: newDist }, { name: "queue size", value: queue.length }],
          note: {
            vi: `Cập nhật dist[${nr}][${nc}] = ${newDist} và đưa (${newDist}, ${nr}, ${nc}) vào priority queue.`,
            en: `Update dist[${nr}][${nc}] = ${newDist} and push (${newDist}, ${nr}, ${nc}) into the priority queue.`,
          },
        });
      }
    }
  }

  const answer = found ? dist[destR][destC] : -1;
  const pathCells = new Set();
  if (found) {
    let cur = [destR, destC];
    while (cur) {
      pathCells.add(key(cur[0], cur[1]));
      cur = parent[cur[0]][cur[1]];
    }
  }

  const finalCells = grid.map((row, r) =>
    row.map((cell, c) => {
      const cellKey = key(r, c);
      let cls = "empty";
      let label = ".";
      if (cell === 1) { cls = "wall"; label = "X"; }
      else if (dist[r][c] < INF) { cls = "visited"; label = String(dist[r][c]); }
      if (pathCells.has(cellKey)) cls = cell === 1 ? "wall" : (r === destR && c === destC) ? "end" : (r === startR && c === startC) ? "start" : "path";
      if (r === startR && c === startC) { cls = pathCells.has(cellKey) ? "start" : "start"; label = "*"; }
      if (r === destR && c === destC) { cls = "end"; label = "#"; }
      return { label, cls };
    })
  );

  const fs = {
    title: answer === -1
      ? { vi: "Không thể dừng ở destination → -1", en: "Cannot stop at destination → -1" }
      : { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [],
    bfsGrid: { rows, cols, cells: finalCells },
    highlight: [],
    mark: [],
    final: true,
    codeLines: [15, 16],
    vars: [{ name: "answer", value: answer }],
    note: answer === -1
      ? { vi: "Dijkstra kết thúc mà chưa từng DỪNG (không chỉ đi qua) tại destination → không có đường, trả -1.", en: "Dijkstra finished without ever STOPPING (not just passing through) at the destination → no path exists, return -1." }
      : { vi: `Bóng dừng tại destination lần đầu với dist=${answer} (số ô trống đã lăn qua). Đường đi được tô xanh.`, en: `The ball first stops at the destination with dist=${answer} (empty cells traveled). The path is highlighted.` },
  };
  steps.push(fs);

  return { original: grid, answer, steps };
}

/**
 * LeetCode 329: Longest Increasing Path in a Matrix — DFS + memoization.
 * dfs(r,c) = length of the longest strictly increasing path starting at (r,c).
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def longestIncreasingPath(self, matrix):
 *  3          rows, cols = len(matrix), len(matrix[0])
 *  4          memo = [[0]*cols for _ in range(rows)]
 *  5          def dfs(r, c):
 *  6              if memo[r][c]: return memo[r][c]
 *  7              best = 1
 *  8              for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
 *  9                  nr, nc = r+dr, c+dc
 * 10                  if 0<=nr<rows and 0<=nc<cols and matrix[nr][nc] > matrix[r][c]:
 * 11                      best = max(best, 1 + dfs(nr, nc))
 * 12              memo[r][c] = best
 * 13              return best
 * 14          return max(dfs(r,c) for r in range(rows) for c in range(cols))
 */
function buildSteps329(input) {
  // Parse matrix: rows separated by ';' or '|', values by ','
  const matrix = String(input)
    .split(/[;|]/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((v) => Number(v.trim())));

  const steps = [];
  if (!matrix.length || !matrix[0].length) {
    steps.push({
      title: { vi: "Ma trận rỗng → 0", en: "Empty matrix → 0" },
      arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true, codeLines: [3], vars: [{ name: "answer", value: 0 }],
      note: { vi: "Nhập ma trận dạng 9,9,4;6,6,8;2,1,1", en: "Enter matrix like 9,9,4;6,6,8;2,1,1" },
    });
    return { original: matrix, answer: 0, steps };
  }

  const rows = matrix.length;
  const cols = matrix[0].length;
  const memo = Array.from({ length: rows }, () => Array(cols).fill(0));
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  function makeCells(cur, path) {
    const pathSet = new Set((path || []).map(([r, c]) => `${r},${c}`));
    return matrix.map((row, r) =>
      row.map((val, c) => {
        let cls = "empty";
        if (memo[r][c] > 0) cls = "visited";
        if (pathSet.has(`${r},${c}`)) cls = "path";
        if (cur && cur[0] === r && cur[1] === c) cls = "current";
        const label = memo[r][c] > 0 ? `${val}·${memo[r][c]}` : String(val);
        return { label, cls };
      })
    );
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(opts.cur, opts.path) },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snap({
    title: { vi: "Khởi tạo memo = 0", en: "Initialize memo = 0" },
    codeLines: [3, 4],
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi:
        `Ma trận ${rows}×${cols}. memo[r][c] = độ dài đường tăng dài nhất BẮT ĐẦU từ (r,c).\n` +
        `Nhãn ô hiển thị "giá trị·memo". DFS + ghi nhớ để mỗi ô chỉ tính 1 lần.`,
      en:
        `Matrix ${rows}×${cols}. memo[r][c] = length of the longest increasing path STARTING at (r,c).\n` +
        `Cell label shows "value·memo". DFS + memoization so each cell is computed once.`,
    },
  });

  let overallBest = 0;
  let bestStart = null;

  function dfs(r, c, depth) {
    if (memo[r][c]) {
      snap({
        title: { vi: `dfs(${r},${c}): memo đã có = ${memo[r][c]}`, en: `dfs(${r},${c}): memo hit = ${memo[r][c]}` },
        cur: [r, c],
        codeLines: [6],
        vars: [{ name: "r,c", value: `${r},${c}` }, { name: "memo[r][c]", value: memo[r][c] }],
        note: {
          vi: `Ô (${r},${c}) đã được tính trước đó = ${memo[r][c]}. Trả về ngay, không tính lại.`,
          en: `Cell (${r},${c}) was computed before = ${memo[r][c]}. Return immediately, no recomputation.`,
        },
      });
      return memo[r][c];
    }

    snap({
      title: { vi: `dfs(${r},${c}) = ? (giá trị ${matrix[r][c]})`, en: `dfs(${r},${c}) = ? (value ${matrix[r][c]})` },
      cur: [r, c],
      codeLines: [5, 7],
      vars: [{ name: "r,c", value: `${r},${c}` }, { name: "matrix[r][c]", value: matrix[r][c] }, { name: "best", value: 1 }],
      note: {
        vi: `Bắt đầu dfs tại (${r},${c}), giá trị ${matrix[r][c]}. best = 1 (ít nhất chính ô này). Thử 4 hướng đi tới ô LỚN HƠN.`,
        en: `Start dfs at (${r},${c}), value ${matrix[r][c]}. best = 1 (at least this cell). Try 4 directions to a LARGER cell.`,
      },
    });

    let best = 1;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
        snap({
          title: { vi: `(${r},${c})→(${nr},${nc}): ${matrix[nr][nc]} > ${matrix[r][c]} ✓`, en: `(${r},${c})→(${nr},${nc}): ${matrix[nr][nc]} > ${matrix[r][c]} ✓` },
          cur: [nr, nc],
          path: [[r, c], [nr, nc]],
          codeLines: [8, 9, 10, 11],
          vars: [
            { name: "from", value: `(${r},${c})=${matrix[r][c]}` },
            { name: "to", value: `(${nr},${nc})=${matrix[nr][nc]}` },
            { name: "best so far", value: best },
          ],
          note: {
            vi: `Ô kề (${nr},${nc})=${matrix[nr][nc]} > ${matrix[r][c]} nên đi tiếp được. Đệ quy dfs(${nr},${nc}), rồi best = max(best, 1 + kết quả).`,
            en: `Neighbor (${nr},${nc})=${matrix[nr][nc]} > ${matrix[r][c]}, so we can extend. Recurse dfs(${nr},${nc}), then best = max(best, 1 + result).`,
          },
        });
        best = Math.max(best, 1 + dfs(nr, nc, depth + 1));
      }
    }

    memo[r][c] = best;
    snap({
      title: { vi: `memo[${r}][${c}] = ${best}`, en: `memo[${r}][${c}] = ${best}` },
      cur: [r, c],
      codeLines: [12, 13],
      vars: [{ name: "r,c", value: `${r},${c}` }, { name: "memo[r][c]", value: best }],
      note: {
        vi: `Đường tăng dài nhất bắt đầu từ (${r},${c}) = ${best}. Ghi vào memo để tái sử dụng.`,
        en: `Longest increasing path starting at (${r},${c}) = ${best}. Store in memo for reuse.`,
      },
    });
    return best;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = dfs(r, c, 0);
      if (val > overallBest) {
        overallBest = val;
        bestStart = [r, c];
      }
    }
  }

  snap({
    title: { vi: `Kết quả: ${overallBest}`, en: `Result: ${overallBest}` },
    cur: bestStart,
    final: true,
    codeLines: [14],
    vars: [{ name: "answer", value: overallBest }],
    note: {
      vi: `Đường tăng dài nhất trong ma trận có độ dài ${overallBest} (bắt đầu từ ô ${bestStart ? `(${bestStart[0]},${bestStart[1]})` : "-"}).`,
      en: `The longest increasing path in the matrix has length ${overallBest} (starting at ${bestStart ? `(${bestStart[0]},${bestStart[1]})` : "-"}).`,
    },
  });

  return { original: matrix, answer: overallBest, steps };
}

/**
 * LeetCode 269: Alien Dictionary — build graph from adjacent word pairs,
 * then Kahn's topological sort (BFS on indegrees).
 *
 * Code lines (1-indexed):
 *  1  from collections import defaultdict, deque
 *  2  class Solution:
 *  3      def alienOrder(self, words):
 *  4          graph = defaultdict(set)
 *  5          indegree = {c: 0 for w in words for c in w}
 *  6          for w1, w2 in zip(words, words[1:]):
 *  7              for a, b in zip(w1, w2):
 *  8                  if a != b:
 *  9                      if b not in graph[a]:
 * 10                          graph[a].add(b); indegree[b] += 1
 * 11                      break
 * 12              else:
 * 13                  if len(w1) > len(w2): return ""
 * 14          queue = deque([c for c in indegree if indegree[c]==0])
 * 15          result = []
 * 16          while queue:
 * 17              c = queue.popleft(); result.append(c)
 * 18              for nxt in graph[c]:
 * 19                  indegree[nxt] -= 1
 * 20                  if indegree[nxt]==0: queue.append(nxt)
 * 21          if len(result) < len(indegree): return ""
 * 22          return "".join(result)
 */
function buildSteps269(input) {
  const words = String(input).split(/[,\s]+/).map((w) => w.trim()).filter(Boolean);
  const steps = [];

  // Collect all unique chars
  const allChars = [...new Set(words.join("").split(""))].sort();
  const graph = {};       // char -> Set of chars
  const indegree = {};
  allChars.forEach((c) => { graph[c] = new Set(); indegree[c] = 0; });

  const nodesArr = () => allChars.map((c) => ({ id: c, label: c, dist: String(indegree[c]) }));
  const edgesArr = () => {
    const e = [];
    for (const [u, set] of Object.entries(graph)) for (const v of set) e.push({ u, v });
    return e;
  };
  const indegStr = () => `{${allChars.map((c) => `${c}:${indegree[c]}`).join(", ")}}`;

  function gsnap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes: nodesArr(),
        edges: edgesArr(),
        hlNodes: opts.hlNodes || [],
        hlEdges: opts.hlEdges || [],
        visitedNodes: opts.visited || [],
      },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gsnap({
    title: { vi: "Khởi tạo graph & indegree", en: "Initialize graph & indegree" },
    codeLines: [4, 5],
    vars: [
      { name: "words", value: `[${words.join(", ")}]` },
      { name: "chars", value: `{${allChars.join(", ")}}` },
      { name: "indegree", value: indegStr() },
    ],
    note: {
      vi:
        `Các ký tự: {${allChars.join(", ")}}. Mỗi node hiển thị indegree (số cạnh đi vào).\n` +
        `So sánh từng cặp từ liền nhau để suy ra thứ tự: ký tự KHÁC NHAU đầu tiên cho biết a đứng trước b.`,
      en:
        `Characters: {${allChars.join(", ")}}. Each node shows its indegree (incoming edges).\n` +
        `Compare adjacent word pairs: the FIRST differing char tells us a comes before b.`,
    },
  });

  // Build edges from adjacent pairs
  let invalid = false;
  for (let i = 0; i < words.length - 1 && !invalid; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);
    let found = false;
    for (let j = 0; j < minLen; j++) {
      if (w1[j] !== w2[j]) {
        found = true;
        const a = w1[j], b = w2[j];
        if (!graph[a].has(b)) {
          graph[a].add(b);
          indegree[b] += 1;
        }
        gsnap({
          title: { vi: `"${w1}" vs "${w2}" → ${a} trước ${b}`, en: `"${w1}" vs "${w2}" → ${a} before ${b}` },
          hlNodes: [a, b],
          hlEdges: [[a, b]],
          codeLines: [6, 7, 8, 9, 10, 11],
          vars: [
            { name: "w1, w2", value: `"${w1}", "${w2}"` },
            { name: "first diff", value: `${a} ≠ ${b}` },
            { name: "edge", value: `${a} → ${b}` },
            { name: "indegree", value: indegStr() },
          ],
          note: {
            vi: `Ký tự khác nhau đầu tiên: '${a}' vs '${b}' → thêm cạnh ${a} → ${b}, indegree[${b}] = ${indegree[b]}. Dừng so sánh cặp này.`,
            en: `First differing char: '${a}' vs '${b}' → add edge ${a} → ${b}, indegree[${b}] = ${indegree[b]}. Stop comparing this pair.`,
          },
        });
        break;
      }
    }
    if (!found && w1.length > w2.length) {
      invalid = true;
      gsnap({
        title: { vi: `"${w1}" dài hơn "${w2}" nhưng là tiền tố → không hợp lệ`, en: `"${w1}" longer than "${w2}" but is a prefix → invalid` },
        codeLines: [12, 13],
        vars: [{ name: "w1, w2", value: `"${w1}", "${w2}"` }, { name: "answer", value: '""' }],
        final: true,
        note: {
          vi: `"${w1}" là tiền tố của "${w2}" nhưng dài hơn → thứ tự không hợp lệ → trả về "".`,
          en: `"${w1}" is a prefix of "${w2}" but longer → invalid ordering → return "".`,
        },
      });
    }
  }

  if (invalid) return { original: words, answer: "", steps };

  // Kahn's algorithm
  const queue = allChars.filter((c) => indegree[c] === 0);
  const result = [];
  const visited = [];

  gsnap({
    title: { vi: `queue = [${queue.join(", ")}] (indegree 0)`, en: `queue = [${queue.join(", ")}] (indegree 0)` },
    hlNodes: [...queue],
    codeLines: [14, 15],
    vars: [
      { name: "queue", value: `[${queue.join(", ")}]` },
      { name: "indegree", value: indegStr() },
    ],
    note: {
      vi: `Bắt đầu topo sort: đưa mọi ký tự có indegree = 0 vào queue: [${queue.join(", ")}]. Đây là các ký tự không có gì đứng trước.`,
      en: `Start topo sort: enqueue every char with indegree = 0: [${queue.join(", ")}]. These have nothing before them.`,
    },
  });

  while (queue.length) {
    const c = queue.shift();
    result.push(c);
    visited.push(c);

    gsnap({
      title: { vi: `Pop '${c}' → result = "${result.join("")}"`, en: `Pop '${c}' → result = "${result.join("")}"` },
      hlNodes: [c],
      visited: [...visited],
      codeLines: [16, 17],
      vars: [
        { name: "c", value: c },
        { name: "result", value: `"${result.join("")}"` },
        { name: "queue", value: `[${queue.join(", ")}]` },
      ],
      note: {
        vi: `Lấy '${c}' khỏi queue, thêm vào result. Giờ giảm indegree các ký tự mà '${c}' trỏ tới.`,
        en: `Pop '${c}' from queue, append to result. Now decrement indegree of chars '${c}' points to.`,
      },
    });

    for (const nxt of [...graph[c]].sort()) {
      indegree[nxt] -= 1;
      const ready = indegree[nxt] === 0;
      if (ready) queue.push(nxt);
      gsnap({
        title: { vi: `indegree[${nxt}] → ${indegree[nxt]}${ready ? ` → thêm vào queue` : ""}`, en: `indegree[${nxt}] → ${indegree[nxt]}${ready ? ` → enqueue` : ""}` },
        hlNodes: [c, nxt],
        hlEdges: [[c, nxt]],
        visited: [...visited],
        codeLines: [18, 19, 20],
        vars: [
          { name: "c → nxt", value: `${c} → ${nxt}` },
          { name: `indegree[${nxt}]`, value: indegree[nxt] },
          { name: "queue", value: `[${queue.join(", ")}]` },
        ],
        note: {
          vi: ready
            ? `Bỏ cạnh ${c} → ${nxt}: indegree[${nxt}] = 0 → mọi ký tự trước '${nxt}' đã xử lý → thêm '${nxt}' vào queue.`
            : `Bỏ cạnh ${c} → ${nxt}: indegree[${nxt}] = ${indegree[nxt]} (còn > 0, chưa sẵn sàng).`,
          en: ready
            ? `Remove edge ${c} → ${nxt}: indegree[${nxt}] = 0 → all predecessors of '${nxt}' done → enqueue '${nxt}'.`
            : `Remove edge ${c} → ${nxt}: indegree[${nxt}] = ${indegree[nxt]} (still > 0, not ready).`,
        },
      });
    }
  }

  const cycle = result.length < allChars.length;
  const answer = cycle ? "" : result.join("");

  gsnap({
    title: cycle
      ? { vi: `Còn ký tự chưa xử lý → có chu trình → ""`, en: `Unprocessed chars remain → cycle → ""` }
      : { vi: `return "${answer}"`, en: `return "${answer}"` },
    visited: [...visited],
    final: true,
    codeLines: cycle ? [21] : [22],
    vars: [
      { name: "result", value: `"${result.join("")}"` },
      { name: "total chars", value: allChars.length },
      { name: "answer", value: `"${answer}"` },
    ],
    note: cycle
      ? {
          vi: `Chỉ xử lý được ${result.length}/${allChars.length} ký tự → tồn tại chu trình → không có thứ tự hợp lệ → "".`,
          en: `Only ${result.length}/${allChars.length} chars processed → a cycle exists → no valid order → "".`,
        }
      : {
          vi: `Thứ tự bảng chữ cái người ngoài hành tinh: "${answer}".`,
          en: `Alien alphabet order: "${answer}".`,
        },
  });

  return { original: words, answer, steps };
}

/**
 * LeetCode 1192: Critical Connections in a Network — Tarjan's bridge finding.
 * disc[u] = DFS discovery time; low[u] = lowest disc reachable from u's subtree.
 * Edge (u, v) is a BRIDGE iff low[v] > disc[u] (v's subtree can't reach u or above
 * except through this edge).
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def criticalConnections(self, n, connections):
 *  3          graph = defaultdict(list)
 *  4          for u, v in connections: graph[u].append(v); graph[v].append(u)
 *  5          disc = [-1]*n; low = [0]*n; bridges = []; timer = [0]
 *  6          def dfs(node, parent):
 *  7              disc[node] = low[node] = timer[0]; timer[0] += 1
 *  8              for nxt in graph[node]:
 *  9                  if nxt == parent: continue
 * 10                  if disc[nxt] == -1:
 * 11                      dfs(nxt, node)
 * 12                      low[node] = min(low[node], low[nxt])
 * 13                      if low[nxt] > disc[node]: bridges.append([node, nxt])
 * 14                  else:
 * 15                      low[node] = min(low[node], disc[nxt])
 * 16          for i in range(n):
 * 17              if disc[i] == -1: dfs(i, -1)
 * 18          return bridges
 */
function buildSteps1192(input, params) {
  const n = params && params.n !== undefined ? Number(params.n) : 4;
  // connections: "u-v,u-v,..."
  const conns = String(input).split(",").map((s) => s.trim()).filter(Boolean).map((pair) => {
    const [u, v] = pair.split("-").map((x) => Number(x.trim()));
    return [u, v];
  });

  const steps = [];
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of conns) {
    graph[u].push(v);
    graph[v].push(u);
  }

  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const bridges = [];
  let timer = 0;

  const nodes = () => Array.from({ length: n }, (_, id) => ({ id, label: String(id), dist: disc[id] >= 0 ? `d${disc[id]}/l${low[id]}` : "" }));
  const edges = conns.map(([u, v]) => ({ u, v, undirected: true }));
  const annotStr = () => {
    const a = {};
    for (let i = 0; i < n; i++) if (disc[i] >= 0) a[i] = `${disc[i]}/${low[i]}`;
    return a;
  };

  function gsnap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes: nodes(),
        edges,
        hlNodes: opts.hlNodes || [],
        hlEdges: opts.hlEdges || [],
        visitedNodes: opts.visited || [],
        annotations: annotStr(),
        dimUnfocused: false,
      },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gsnap({
    title: { vi: "Xây graph vô hướng, disc/low = -1", en: "Build undirected graph, disc/low = -1" },
    codeLines: [3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "connections", value: conns.map(([u, v]) => `${u}-${v}`).join(", ") },
    ],
    note: {
      vi:
        `Thuật toán Tarjan tìm CẦU (bridge): cạnh mà xóa đi sẽ làm đồ thị mất liên thông.\n` +
        `disc[u] = thời điểm DFS thăm u. low[u] = disc nhỏ nhất mà u (và con cháu) có thể quay ngược tới.\n` +
        `Nhãn node hiển thị "disc/low".`,
      en:
        `Tarjan's algorithm finds BRIDGES: edges whose removal disconnects the graph.\n` +
        `disc[u] = DFS discovery time of u. low[u] = smallest disc reachable from u's subtree (via back edges).\n` +
        `Node labels show "disc/low".`,
    },
  });

  function dfs(node, parent) {
    disc[node] = low[node] = timer;
    timer += 1;

    gsnap({
      title: { vi: `dfs(${node}): disc=low=${disc[node]}`, en: `dfs(${node}): disc=low=${disc[node]}` },
      hlNodes: [node],
      visited: disc.map((d, i) => (d >= 0 ? i : -1)).filter((x) => x >= 0),
      codeLines: [6, 7],
      vars: [
        { name: "node", value: node },
        { name: "parent", value: parent },
        { name: `disc[${node}]`, value: disc[node] },
        { name: `low[${node}]`, value: low[node] },
        { name: "timer", value: timer },
      ],
      note: {
        vi: `Thăm node ${node}: gán disc[${node}] = low[${node}] = ${disc[node]}. Duyệt các hàng xóm (trừ parent=${parent}).`,
        en: `Visit node ${node}: set disc[${node}] = low[${node}] = ${disc[node]}. Explore neighbors (except parent=${parent}).`,
      },
    });

    for (const nxt of graph[node]) {
      if (nxt === parent) continue;
      if (disc[nxt] === -1) {
        gsnap({
          title: { vi: `Cạnh cây ${node}→${nxt} (chưa thăm) → đệ quy`, en: `Tree edge ${node}→${nxt} (unvisited) → recurse` },
          hlNodes: [node, nxt],
          hlEdges: [[node, nxt]],
          visited: disc.map((d, i) => (d >= 0 ? i : -1)).filter((x) => x >= 0),
          codeLines: [8, 9, 10, 11],
          vars: [{ name: "node", value: node }, { name: "nxt", value: nxt }],
          note: {
            vi: `${nxt} chưa được thăm (disc=-1) → đây là cạnh cây. Đệ quy dfs(${nxt}, ${node}).`,
            en: `${nxt} is unvisited (disc=-1) → tree edge. Recurse dfs(${nxt}, ${node}).`,
          },
        });
        dfs(nxt, node);
        low[node] = Math.min(low[node], low[nxt]);

        const isBridge = low[nxt] > disc[node];
        if (isBridge) bridges.push([node, nxt]);
        gsnap({
          title: { vi: `low[${node}] = min → ${low[node]}${isBridge ? ` · CẦU ${node}-${nxt}!` : ""}`, en: `low[${node}] = min → ${low[node]}${isBridge ? ` · BRIDGE ${node}-${nxt}!` : ""}` },
          hlNodes: [node, nxt],
          hlEdges: [[node, nxt]],
          visited: disc.map((d, i) => (d >= 0 ? i : -1)).filter((x) => x >= 0),
          codeLines: [12, 13],
          vars: [
            { name: `low[${node}]`, value: low[node] },
            { name: `low[${nxt}]`, value: low[nxt] },
            { name: `disc[${node}]`, value: disc[node] },
            { name: "low[nxt] > disc[node]?", value: isBridge },
          ],
          note: {
            vi: isBridge
              ? `low[${nxt}]=${low[nxt]} > disc[${node}]=${disc[node]} → từ ${nxt} KHÔNG có đường vòng nào quay về ${node} hay tổ tiên → cạnh ${node}-${nxt} là CẦU.`
              : `low[${nxt}]=${low[nxt]} ≤ disc[${node}]=${disc[node]} → ${nxt} có đường vòng khác quay về ${node} hoặc trên nữa → KHÔNG phải cầu. Cập nhật low[${node}]=${low[node]}.`,
            en: isBridge
              ? `low[${nxt}]=${low[nxt]} > disc[${node}]=${disc[node]} → ${nxt} has NO back route to ${node} or above → edge ${node}-${nxt} is a BRIDGE.`
              : `low[${nxt}]=${low[nxt]} ≤ disc[${node}]=${disc[node]} → ${nxt} can reach ${node} or higher another way → NOT a bridge. Update low[${node}]=${low[node]}.`,
          },
        });
      } else {
        low[node] = Math.min(low[node], disc[nxt]);
        gsnap({
          title: { vi: `Cạnh ngược ${node}→${nxt}: low[${node}]=${low[node]}`, en: `Back edge ${node}→${nxt}: low[${node}]=${low[node]}` },
          hlNodes: [node, nxt],
          hlEdges: [[node, nxt]],
          visited: disc.map((d, i) => (d >= 0 ? i : -1)).filter((x) => x >= 0),
          codeLines: [14, 15],
          vars: [
            { name: "node", value: node },
            { name: "nxt (visited)", value: nxt },
            { name: `disc[${nxt}]`, value: disc[nxt] },
            { name: `low[${node}]`, value: low[node] },
          ],
          note: {
            vi: `${nxt} đã thăm → cạnh ngược. low[${node}] = min(low[${node}], disc[${nxt}]=${disc[nxt]}) = ${low[node]}. Đây là đường vòng giúp node quay lại sớm hơn.`,
            en: `${nxt} already visited → back edge. low[${node}] = min(low[${node}], disc[${nxt}]=${disc[nxt]}) = ${low[node]}. This back route lets node reach earlier.`,
          },
        });
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (disc[i] === -1) dfs(i, -1);
  }

  gsnap({
    title: { vi: `Kết quả: ${bridges.length} cầu`, en: `Result: ${bridges.length} bridge(s)` },
    hlEdges: bridges.map(([u, v]) => [u, v]),
    visited: Array.from({ length: n }, (_, i) => i),
    final: true,
    codeLines: [18],
    vars: [
      { name: "bridges", value: bridges.map(([u, v]) => `[${u},${v}]`).join(", ") || "none" },
    ],
    note: {
      vi: `Các cầu (critical connections): ${bridges.map(([u, v]) => `${u}-${v}`).join(", ") || "không có"}. Xóa bất kỳ cầu nào sẽ làm mạng mất liên thông.`,
      en: `Bridges (critical connections): ${bridges.map(([u, v]) => `${u}-${v}`).join(", ") || "none"}. Removing any bridge disconnects the network.`,
    },
  });

  return { original: conns, answer: bridges, steps };
}

/**
 * LeetCode 317: Shortest Distance from All Buildings — multi-source BFS.
 * From EACH building run a BFS; accumulate total_dist[cell] and reach[cell].
 * Answer = min total_dist over empty cells reachable by ALL buildings.
 *
 * grid: 0 = empty land, 1 = building, 2 = obstacle.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def shortestDistance(self, grid):
 *  3          rows, cols = len(grid), len(grid[0])
 *  4          total = [[0]*cols for _ in range(rows)]
 *  5          reach = [[0]*cols for _ in range(rows)]
 *  6          buildings = 0
 *  7          for r in range(rows):
 *  8              for c in range(cols):
 *  9                  if grid[r][c] == 1:
 * 10                      buildings += 1
 * 11                      bfs(r, c)   # accumulate distances & reach
 * 12          best = inf
 * 13          for r in range(rows):
 * 14              for c in range(cols):
 * 15                  if grid[r][c] == 0 and reach[r][c] == buildings:
 * 16                      best = min(best, total[r][c])
 * 17          return best if best != inf else -1
 */
function buildSteps317(input) {
  const grid = String(input)
    .split(/[;|]/).map((row) => row.trim()).filter(Boolean)
    .map((row) => row.split(",").map((v) => Number(v.trim())));

  const steps = [];
  if (!grid.length || !grid[0].length) {
    steps.push({
      title: { vi: "Lưới rỗng → -1", en: "Empty grid → -1" },
      arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true, codeLines: [3], vars: [{ name: "answer", value: -1 }],
      note: { vi: "Nhập lưới dạng 1,0,2,0,1;0,0,0,0,0;0,0,1,0,0", en: "Enter grid like 1,0,2,0,1;0,0,0,0,0;0,0,1,0,0" },
    });
    return { original: grid, answer: -1, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const total = Array.from({ length: rows }, () => Array(cols).fill(0));
  const reach = Array.from({ length: rows }, () => Array(cols).fill(0));
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  function makeCells(highlightCell, bestCell) {
    return grid.map((row, r) =>
      row.map((v, c) => {
        let cls, label;
        if (v === 1) { cls = "start"; label = "🏢"; }
        else if (v === 2) { cls = "wall"; label = "▧"; }
        else {
          // empty
          cls = reach[r][c] > 0 ? "visited" : "empty";
          label = reach[r][c] > 0 ? `${total[r][c]}` : "·";
        }
        if (bestCell && bestCell[0] === r && bestCell[1] === c) cls = "path";
        if (highlightCell && highlightCell[0] === r && highlightCell[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(opts.cur, opts.best) },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Count buildings
  const buildingList = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === 1) buildingList.push([r, c]);
  const buildings = buildingList.length;

  snap({
    title: { vi: "Khởi tạo total, reach = 0", en: "Initialize total, reach = 0" },
    codeLines: [3, 4, 5, 6],
    vars: [
      { name: "rows,cols", value: `${rows},${cols}` },
      { name: "buildings", value: buildings },
    ],
    note: {
      vi:
        `🏢 = tòa nhà (1), ▧ = chướng ngại (2), số = tổng khoảng cách tới các tòa nhà.\n` +
        `Chạy BFS từ MỖI tòa nhà, cộng dồn total[ô] và reach[ô] (số tòa nhà tới được ô đó).\n` +
        `Đáp án = min total[ô] trong các ô trống được TẤT CẢ ${buildings} tòa nhà tới được.`,
      en:
        `🏢 = building (1), ▧ = obstacle (2), number = total distance to all buildings.\n` +
        `Run BFS from EACH building, accumulating total[cell] and reach[cell] (how many buildings reach it).\n` +
        `Answer = min total[cell] among empty cells reached by ALL ${buildings} buildings.`,
    },
  });

  // BFS from each building
  for (let b = 0; b < buildingList.length; b++) {
    const [sr, sc] = buildingList[b];
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [[sr, sc, 0]];
    visited[sr][sc] = true;
    let head = 0;
    while (head < queue.length) {
      const [r, c, d] = queue[head++];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc] === 0) {
          visited[nr][nc] = true;
          total[nr][nc] += d + 1;
          reach[nr][nc] += 1;
          queue.push([nr, nc, d + 1]);
        }
      }
    }

    snap({
      title: { vi: `BFS từ tòa nhà #${b + 1} tại (${sr},${sc})`, en: `BFS from building #${b + 1} at (${sr},${sc})` },
      cur: [sr, sc],
      codeLines: [7, 8, 9, 10, 11],
      vars: [
        { name: "building", value: `#${b + 1} (${sr},${sc})` },
        { name: "buildings done", value: b + 1 },
      ],
      note: {
        vi: `Chạy BFS từ tòa nhà (${sr},${sc}). Mỗi ô trống tới được: total += khoảng cách, reach += 1. Số trong ô = tổng khoảng cách tích lũy tới giờ.`,
        en: `Run BFS from building (${sr},${sc}). Each reachable empty cell: total += distance, reach += 1. The number in each cell = accumulated total so far.`,
      },
    });
  }

  // Find minimum
  let best = Infinity;
  let bestCell = null;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0 && reach[r][c] === buildings) {
        if (total[r][c] < best) { best = total[r][c]; bestCell = [r, c]; }
      }
    }
  }

  const answer = best === Infinity ? -1 : best;
  snap({
    title: answer === -1
      ? { vi: "Không ô nào tới được mọi tòa nhà → -1", en: "No cell reaches all buildings → -1" }
      : { vi: `Đáp án: ${answer} tại ô ${bestCell ? `(${bestCell[0]},${bestCell[1]})` : ""}`, en: `Answer: ${answer} at cell ${bestCell ? `(${bestCell[0]},${bestCell[1]})` : ""}` },
    best: bestCell,
    final: true,
    codeLines: [12, 13, 14, 15, 16, 17],
    vars: [
      { name: "buildings", value: buildings },
      { name: "best cell", value: bestCell ? `(${bestCell[0]},${bestCell[1]})` : "none" },
      { name: "answer", value: answer },
    ],
    note: {
      vi: answer === -1
        ? `Không có ô trống nào được cả ${buildings} tòa nhà tới được → -1.`
        : `Quét các ô trống có reach == ${buildings} (được mọi tòa nhà tới). Ô có total nhỏ nhất là (${bestCell[0]},${bestCell[1]}) với tổng khoảng cách ${answer}.`,
      en: answer === -1
        ? `No empty cell is reachable by all ${buildings} buildings → -1.`
        : `Scan empty cells with reach == ${buildings} (reached by every building). The one with the smallest total is (${bestCell[0]},${bestCell[1]}) with total distance ${answer}.`,
    },
  });

  return { original: grid, answer, steps };
}

/**
 * LeetCode 489: Robot Room Cleaner — backtracking DFS with relative turns.
 * The robot only knows move()/turnLeft()/turnRight()/clean(). We track absolute
 * (row, col, facing) ourselves and backtrack ("go back") after exploring.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def cleanRoom(self, robot):
 *  3          visited = set()
 *  4          def go_back():
 *  5              robot.turnRight(); robot.turnRight()
 *  6              robot.move()
 *  7              robot.turnRight(); robot.turnRight()
 *  8          def dfs(r, c, d):
 *  9              visited.add((r, c)); robot.clean()
 * 10              for i in range(4):
 * 11                  nd = (d + i) % 4
 * 12                  nr, nc = r + dir[nd]
 * 13                  if (nr, nc) not in visited and robot.move():
 * 14                      dfs(nr, nc, nd)
 * 15                      go_back()
 * 16                  robot.turnRight()
 * 17          dfs(0, 0, 0)
 */
function buildSteps489(input) {
  // grid: rows of 0/1 (1 = accessible, 0 = wall). Robot starts at first 1 (top-left area).
  const grid = String(input)
    .split(/[;|]/).map((row) => row.trim()).filter(Boolean)
    .map((row) => row.split(",").map((v) => Number(v.trim())));

  const steps = [];
  if (!grid.length || !grid[0].length) {
    steps.push({
      title: { vi: "Lưới rỗng", en: "Empty grid" },
      arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true, codeLines: [3], vars: [], note: { vi: "Nhập lưới 0/1.", en: "Enter a 0/1 grid." },
    });
    return { original: grid, answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  // Robot starts at param or default (0,0) — but must be on a 1.
  let start = [0, 0];
  outer: for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === 1) { start = [r, c]; break outer; }

  const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // up, right, down, left
  const dirName = ["↑", "→", "↓", "←"];
  const visited = new Set();
  const cleaned = new Set();

  function makeCells(cur, facing) {
    return grid.map((row, r) =>
      row.map((v, c) => {
        let cls, label;
        if (v === 0) { cls = "wall"; label = "▧"; }
        else if (cur && cur[0] === r && cur[1] === c) { cls = "current"; label = dirName[facing]; }
        else if (cleaned.has(`${r},${c}`)) { cls = "visited"; label = "✓"; }
        else { cls = "empty"; label = "·"; }
        return { label, cls };
      })
    );
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(opts.cur, opts.facing || 0) },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snap({
    title: { vi: `Bắt đầu dfs tại (${start[0]},${start[1]})`, en: `Start dfs at (${start[0]},${start[1]})` },
    cur: start,
    facing: 0,
    codeLines: [3, 8, 17],
    vars: [
      { name: "start", value: `(${start[0]},${start[1]})` },
      { name: "facing", value: "↑ (up)" },
    ],
    note: {
      vi:
        `Robot chỉ biết move()/turnLeft()/turnRight()/clean() — KHÔNG biết tọa độ. Ta tự theo dõi (r,c,hướng).\n` +
        `✓ = ô đã lau, ▧ = tường, mũi tên = vị trí + hướng robot.\n` +
        `DFS: lau ô hiện tại, thử 4 hướng; đi được thì đệ quy rồi "go_back" quay lại.`,
      en:
        `The robot only knows move()/turnLeft()/turnRight()/clean() — NOT coordinates. We track (r,c,facing) ourselves.\n` +
        `✓ = cleaned, ▧ = wall, arrow = robot position + facing.\n` +
        `DFS: clean current cell, try 4 directions; if it can move, recurse then "go_back".`,
    },
  });

  let guard = 0;
  function dfs(r, c, d) {
    if (guard > 400) return;
    guard += 1;
    visited.add(`${r},${c}`);
    cleaned.add(`${r},${c}`);

    snap({
      title: { vi: `clean (${r},${c})`, en: `clean (${r},${c})` },
      cur: [r, c],
      facing: d,
      codeLines: [9],
      vars: [
        { name: "position", value: `(${r},${c})` },
        { name: "facing", value: `${dirName[d]}` },
        { name: "cleaned", value: cleaned.size },
      ],
      note: {
        vi: `Lau ô (${r},${c}) và đánh dấu visited. Giờ thử lần lượt 4 hướng (bắt đầu từ hướng hiện tại ${dirName[d]}).`,
        en: `Clean cell (${r},${c}) and mark visited. Now try all 4 directions (starting from current facing ${dirName[d]}).`,
      },
    });

    for (let i = 0; i < 4; i++) {
      const nd = (d + i) % 4;
      const nr = r + dirs[nd][0];
      const nc = c + dirs[nd][1];
      const canMove = nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1;
      const notVisited = !visited.has(`${nr},${nc}`);

      if (notVisited && canMove) {
        snap({
          title: { vi: `Hướng ${dirName[nd]}: move() tới (${nr},${nc}) ✓`, en: `Direction ${dirName[nd]}: move() to (${nr},${nc}) ✓` },
          cur: [r, c],
          facing: nd,
          codeLines: [10, 11, 12, 13, 14],
          vars: [
            { name: "trying dir", value: dirName[nd] },
            { name: "next cell", value: `(${nr},${nc})` },
            { name: "can move", value: true },
          ],
          note: {
            vi: `Hướng ${dirName[nd]} tới (${nr},${nc}): chưa thăm và move() thành công → đệ quy dfs(${nr},${nc},${nd}).`,
            en: `Direction ${dirName[nd]} to (${nr},${nc}): unvisited and move() succeeds → recurse dfs(${nr},${nc},${nd}).`,
          },
        });
        dfs(nr, nc, nd);
        // go_back
        snap({
          title: { vi: `go_back → quay lại (${r},${c})`, en: `go_back → return to (${r},${c})` },
          cur: [r, c],
          facing: nd,
          codeLines: [4, 5, 6, 7, 15],
          vars: [
            { name: "back at", value: `(${r},${c})` },
          ],
          note: {
            vi: `Đã lau xong nhánh (${nr},${nc}). go_back: quay 180°, move() về ô cũ, quay 180° lại để giữ đúng hướng đang xét.`,
            en: `Finished the (${nr},${nc}) branch. go_back: turn 180°, move() back, turn 180° again to restore the scanning direction.`,
          },
        });
      } else {
        snap({
          title: { vi: `Hướng ${dirName[nd]}: ${!canMove ? "tường/biên" : "đã thăm"} → bỏ qua`, en: `Direction ${dirName[nd]}: ${!canMove ? "wall/edge" : "visited"} → skip` },
          cur: [r, c],
          facing: nd,
          codeLines: [13, 16],
          vars: [
            { name: "trying dir", value: dirName[nd] },
            { name: "next cell", value: `(${nr},${nc})` },
            { name: "reason", value: !canMove ? "wall/out of bounds" : "already visited" },
          ],
          note: {
            vi: `Hướng ${dirName[nd]} tới (${nr},${nc}): ${!canMove ? "là tường hoặc ngoài phòng" : "đã lau rồi"} → không đi. turnRight() để thử hướng kế tiếp.`,
            en: `Direction ${dirName[nd]} to (${nr},${nc}): ${!canMove ? "wall or out of room" : "already cleaned"} → don't move. turnRight() to try the next direction.`,
          },
        });
      }
    }
  }

  dfs(start[0], start[1], 0);

  const totalFree = grid.flat().filter((v) => v === 1).length;
  snap({
    title: { vi: `Hoàn tất: lau ${cleaned.size}/${totalFree} ô`, en: `Done: cleaned ${cleaned.size}/${totalFree} cells` },
    cur: null,
    final: true,
    codeLines: [17],
    vars: [
      { name: "cleaned", value: cleaned.size },
      { name: "total accessible", value: totalFree },
    ],
    note: {
      vi: `DFS backtracking đã lau toàn bộ ${cleaned.size} ô tới được. Robot quay về đúng vị trí/hướng ban đầu sau mỗi nhánh nhờ go_back.`,
      en: `Backtracking DFS cleaned all ${cleaned.size} reachable cells. The robot restores its position/facing after each branch via go_back.`,
    },
  });

  return { original: grid, answer: cleaned.size, steps };
}

/**
 * LeetCode 864: Shortest Path to Get All Keys — BFS over (row, col, keys) states.
 * keys is a bitmask; state is visited-tracked so we don't revisit the same
 * (cell, keys) combination.
 *
 * grid chars: '@' start, '.' empty, '#' wall, 'a'-'f' keys, 'A'-'F' locks.
 *
 * Code lines (1-indexed):
 *  1  from collections import deque
 *  2  class Solution:
 *  3      def shortestPathAllKeys(self, grid):
 *  4          find start, count all_keys bitmask
 *  5          queue = deque([(sr, sc, 0, 0)])   # r, c, keys, steps
 *  6          visited = {(sr, sc, 0)}
 *  7          while queue:
 *  8              r, c, keys, steps = queue.popleft()
 *  9              if keys == all_keys: return steps
 * 10              for dr, dc in dirs:
 * 11                  nr, nc = r+dr, c+dc
 * 12                  if out of bounds or wall: continue
 * 13                  if locked door without key: continue
 * 14                  new_keys = keys | key_bit if lowercase
 * 15                  if (nr, nc, new_keys) not seen: enqueue
 * 16          return -1
 */
function buildSteps864(input) {
  const grid = String(input).split(/[;|]/).map((row) => row.trim()).filter(Boolean);
  const steps = [];
  if (!grid.length) {
    steps.push({
      title: { vi: "Lưới rỗng → -1", en: "Empty grid → -1" },
      arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true, codeLines: [3], vars: [{ name: "answer", value: -1 }],
      note: { vi: "Nhập lưới dạng @.a..;###.#;b.A.B", en: "Enter grid like @.a..;###.#;b.A.B" },
    });
    return { original: grid, answer: -1, steps };
  }

  const rows = grid.length;
  const cols = Math.max(...grid.map((r) => r.length));
  const cell = (r, c) => (grid[r][c] || "#");

  let start = [0, 0];
  let allKeys = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const ch = grid[r][c];
      if (ch === "@") start = [r, c];
      else if (ch >= "a" && ch <= "f") allKeys |= (1 << (ch.charCodeAt(0) - 97));
    }
  }

  const keysStr = (k) => {
    const s = [];
    for (let i = 0; i < 6; i++) if (k & (1 << i)) s.push(String.fromCharCode(97 + i));
    return s.length ? s.join("") : "∅";
  };

  function makeCells(cur, curKeys) {
    return grid.map((row, r) =>
      Array.from({ length: cols }, (_, c) => {
        const ch = cell(r, c);
        let cls, label = ch;
        if (ch === "#") cls = "wall";
        else if (ch === "@") { cls = "start"; }
        else if (ch >= "a" && ch <= "f") { cls = (curKeys & (1 << (ch.charCodeAt(0) - 97))) ? "visited" : "path"; }
        else if (ch >= "A" && ch <= "F") { cls = "queued"; }
        else { cls = "empty"; label = "·"; }
        if (cur && cur[0] === r && cur[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(opts.cur, opts.keys || 0) },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snap({
    title: { vi: `Khởi tạo BFS: start=(${start[0]},${start[1]})`, en: `Initialize BFS: start=(${start[0]},${start[1]})` },
    cur: start,
    keys: 0,
    codeLines: [4, 5, 6],
    vars: [
      { name: "start", value: `(${start[0]},${start[1]})` },
      { name: "all_keys", value: `${keysStr(allKeys)} (${allKeys})` },
      { name: "keys", value: "∅" },
    ],
    note: {
      vi:
        `@ = xuất phát, chữ thường a-f = chìa khóa, chữ HOA A-F = cửa khóa, # = tường.\n` +
        `Trạng thái BFS = (hàng, cột, tập chìa khóa dạng bitmask). Cần thu đủ ${keysStr(allKeys)}.\n` +
        `visited theo dõi (ô, keys) để không lặp cùng một trạng thái.`,
      en:
        `@ = start, lowercase a-f = keys, UPPERCASE A-F = locks, # = wall.\n` +
        `BFS state = (row, col, keys bitmask). We must collect all keys ${keysStr(allKeys)}.\n` +
        `visited tracks (cell, keys) so the same state isn't repeated.`,
    },
  });

  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const queue = [[start[0], start[1], 0, 0]];
  const visited = new Set([`${start[0]},${start[1]},0`]);
  let head = 0;
  let answer = -1;
  let guard = 0;

  while (head < queue.length && guard < 140) {
    guard += 1;
    const [r, c, keys, dist] = queue[head++];

    if (keys === allKeys) {
      answer = dist;
      snap({
        title: { vi: `✓ Đủ chìa khóa tại (${r},${c}) — ${dist} bước`, en: `✓ All keys at (${r},${c}) — ${dist} steps` },
        cur: [r, c],
        keys,
        final: true,
        codeLines: [8, 9],
        vars: [
          { name: "position", value: `(${r},${c})` },
          { name: "keys", value: keysStr(keys) },
          { name: "steps", value: dist },
        ],
        note: {
          vi: `Thu đủ tất cả chìa khóa (${keysStr(keys)}) sau ${dist} bước. Vì BFS theo lớp, đây là đường NGẮN NHẤT.`,
          en: `Collected all keys (${keysStr(keys)}) after ${dist} steps. Since BFS expands by layers, this is the SHORTEST path.`,
        },
      });
      return { original: grid, answer, steps };
    }

    const popStep = guard <= 60; // limit verbose steps
    if (popStep) {
      snap({
        title: { vi: `Pop (${r},${c}) keys=${keysStr(keys)} bước=${dist}`, en: `Pop (${r},${c}) keys=${keysStr(keys)} steps=${dist}` },
        cur: [r, c],
        keys,
        codeLines: [7, 8, 10],
        vars: [
          { name: "position", value: `(${r},${c})` },
          { name: "keys", value: keysStr(keys) },
          { name: "steps", value: dist },
          { name: "queue size", value: queue.length - head },
        ],
        note: {
          vi: `Lấy trạng thái (${r},${c}) với chìa ${keysStr(keys)}. Thử 4 hướng.`,
          en: `Process state (${r},${c}) with keys ${keysStr(keys)}. Try 4 directions.`,
        },
      });
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= (grid[nr] ? grid[nr].length : 0)) continue;
      const ch = cell(nr, nc);
      if (ch === "#") continue;
      if (ch >= "A" && ch <= "F" && !(keys & (1 << (ch.charCodeAt(0) - 65)))) continue;

      let nk = keys;
      if (ch >= "a" && ch <= "f") nk |= (1 << (ch.charCodeAt(0) - 97));

      const stateKey = `${nr},${nc},${nk}`;
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);
      queue.push([nr, nc, nk, dist + 1]);

      if (popStep && ch >= "a" && ch <= "f" && nk !== keys) {
        snap({
          title: { vi: `Nhặt chìa '${ch}' tại (${nr},${nc}) → keys=${keysStr(nk)}`, en: `Pick key '${ch}' at (${nr},${nc}) → keys=${keysStr(nk)}` },
          cur: [nr, nc],
          keys: nk,
          codeLines: [14, 15],
          vars: [
            { name: "to", value: `(${nr},${nc})` },
            { name: "key found", value: ch },
            { name: "new keys", value: keysStr(nk) },
          ],
          note: {
            vi: `Đi tới (${nr},${nc}) nhặt chìa '${ch}'. Bitmask keys cập nhật thành ${keysStr(nk)}. Thêm trạng thái mới vào queue.`,
            en: `Move to (${nr},${nc}) and pick key '${ch}'. Keys bitmask becomes ${keysStr(nk)}. Enqueue the new state.`,
          },
        });
      }
    }
  }

  snap({
    title: { vi: "Không thu đủ chìa khóa → -1", en: "Cannot collect all keys → -1" },
    cur: null,
    final: true,
    codeLines: [16],
    vars: [{ name: "answer", value: -1 }],
    note: {
      vi: "BFS hết trạng thái mà chưa thu đủ chìa khóa → không thể → -1.",
      en: "BFS exhausted all states without collecting every key → impossible → -1.",
    },
  });

  return { original: grid, answer, steps };
}

/**
 * LeetCode 407: Trapping Rain Water II — min-heap BFS inward from the border.
 * The water level at a cell is bounded by the lowest surrounding wall. Process
 * cells from the lowest boundary height inward.
 *
 * Code lines (1-indexed):
 *  1  import heapq
 *  2  class Solution:
 *  3      def trapRainWater(self, heightMap):
 *  4          push all border cells into a min-heap; mark visited
 *  5          water = 0
 *  6          while heap:
 *  7              height, r, c = heappop(heap)
 *  8              for each unvisited neighbor (nr, nc):
 *  9                  water += max(0, height - heightMap[nr][nc])
 * 10                  push (max(height, heightMap[nr][nc]), nr, nc)
 * 11          return water
 */
function buildSteps407(input) {
  const heightMap = String(input).split(/[;|]/).map((row) => row.trim()).filter(Boolean)
    .map((row) => row.split(",").map((v) => Number(v.trim())));
  const steps = [];

  if (heightMap.length < 3 || heightMap[0].length < 3) {
    steps.push({
      title: { vi: "Lưới < 3×3 → không giữ được nước → 0", en: "Grid < 3×3 → no water → 0" },
      arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "0", cls: "empty" }]] },
      final: true, codeLines: [3], vars: [{ name: "answer", value: 0 }],
      note: { vi: "Cần ít nhất 3×3. Nhập dạng 1,4,3,1,3,2;3,2,1,3,2,4;2,3,3,2,3,1", en: "Need at least 3×3. Enter like 1,4,3,1,3,2;3,2,1,3,2,4;2,3,3,2,3,1" },
    });
    return { original: heightMap, answer: 0, steps };
  }

  const rows = heightMap.length;
  const cols = heightMap[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const waterAt = Array.from({ length: rows }, () => Array(cols).fill(0));

  function makeCells(cur) {
    return heightMap.map((row, r) =>
      row.map((h, c) => {
        let cls = visited[r][c] ? "visited" : "empty";
        if (cur && cur[0] === r && cur[1] === c) cls = "current";
        const label = waterAt[r][c] > 0 ? `${h}+${waterAt[r][c]}💧` : `${h}`;
        return { label, cls };
      })
    );
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(opts.cur) },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Min-heap
  const heap = [];
  const hpush = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]]; i = p;
    }
  };
  const hpop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) { heap[0] = last; let i = 0;
      while (true) { let s = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < heap.length && heap[l][0] < heap[s][0]) s = l;
        if (r < heap.length && heap[r][0] < heap[s][0]) s = r;
        if (s === i) break; [heap[i], heap[s]] = [heap[s], heap[i]]; i = s; } }
    return top;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        hpush([heightMap[r][c], r, c]);
        visited[r][c] = true;
      }
    }
  }

  snap({
    title: { vi: "Đẩy toàn bộ ô biên vào min-heap", en: "Push all border cells into the min-heap" },
    codeLines: [4, 5],
    vars: [
      { name: "rows,cols", value: `${rows},${cols}` },
      { name: "border cells", value: heap.length },
      { name: "water", value: 0 },
    ],
    note: {
      vi:
        `Nước bị giới hạn bởi TƯỜNG THẤP NHẤT xung quanh. Bắt đầu từ biên (không giữ được nước) và tiến vào trong.\n` +
        `Min-heap luôn lấy ô có "mức tường" thấp nhất trước. Nhãn ô = "cao độ+nước💧".`,
      en:
        `Water is bounded by the LOWEST surrounding wall. Start from the border (holds no water) and move inward.\n` +
        `The min-heap always pops the lowest boundary height first. Cell label = "height+water💧".`,
    },
  });

  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let water = 0;
  let guard = 0;

  while (heap.length && guard < 200) {
    guard += 1;
    const [height, r, c] = hpop();
    const verbose = guard <= 80;

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || visited[nr][nc]) continue;
      visited[nr][nc] = true;
      const trapped = Math.max(0, height - heightMap[nr][nc]);
      water += trapped;
      waterAt[nr][nc] = trapped;
      const newHeight = Math.max(height, heightMap[nr][nc]);
      hpush([newHeight, nr, nc]);

      if (verbose) {
        snap({
          title: { vi: `Từ tường ${height} → ô (${nr},${nc}) cao ${heightMap[nr][nc]}: +${trapped}💧`, en: `From wall ${height} → cell (${nr},${nc}) height ${heightMap[nr][nc]}: +${trapped}💧` },
          cur: [nr, nc],
          codeLines: [6, 7, 8, 9, 10],
          vars: [
            { name: "boundary height", value: height },
            { name: "cell height", value: heightMap[nr][nc] },
            { name: "trapped here", value: trapped },
            { name: "new boundary", value: newHeight },
            { name: "total water", value: water },
          ],
          note: {
            vi: `Ô (${nr},${nc}) cao ${heightMap[nr][nc]}. Tường bao quanh thấp nhất = ${height}. Nước giữ = max(0, ${height}-${heightMap[nr][nc]}) = ${trapped}. Đẩy ô với mức tường mới = max(${height},${heightMap[nr][nc]}) = ${newHeight}.`,
            en: `Cell (${nr},${nc}) height ${heightMap[nr][nc]}. Lowest surrounding wall = ${height}. Trapped = max(0, ${height}-${heightMap[nr][nc]}) = ${trapped}. Push with new boundary = max(${height},${heightMap[nr][nc]}) = ${newHeight}.`,
          },
        });
      }
    }
  }

  snap({
    title: { vi: `return water = ${water}`, en: `return water = ${water}` },
    cur: null,
    final: true,
    codeLines: [11],
    vars: [{ name: "answer (water)", value: water }],
    note: {
      vi: `Tổng lượng nước giữ được trên bản đồ 2D = ${water}. Các ô có nước hiển thị "+n💧".`,
      en: `Total 2D trapped rain water = ${water}. Cells with water show "+n💧".`,
    },
  });

  return { original: heightMap, answer: water, steps };
}

/**
 * LeetCode 827: Making A Large Island — detailed line-by-line debugger.
 *
 * Phase 1: recursive DFS labels every island with a unique id (>= 2) and
 *          records its area in size[id]. The grid is mutated in place
 *          (1 -> island_id) exactly like the Python code.
 * Phase 2: best = the largest labeled island (handles the all-land case).
 * Phase 3: try flipping every water (0) cell: sum DISTINCT neighboring
 *          island sizes + 1 (the flipped cell itself); track the max.
 *
 * Code lines (1-indexed) match code exactly:
 *  1  class Solution:
 *  2      def largestIsland(self, grid):
 *  3          n = len(grid)
 *  4          size = {}
 *  5          def dfs(r, c, island_id):
 *  6              if r < 0 or r >= n or c < 0 or c >= n or grid[r][c] != 1:
 *  7                  return 0
 *  8              grid[r][c] = island_id
 *  9              area = 1
 * 10              area += dfs(r + 1, c, island_id)
 * 11              area += dfs(r - 1, c, island_id)
 * 12              area += dfs(r, c + 1, island_id)
 * 13              area += dfs(r, c - 1, island_id)
 * 14              return area
 * 15          island_id = 2
 * 16          for r in range(n):
 * 17              for c in range(n):
 * 18                  if grid[r][c] == 1:
 * 19                      size[island_id] = dfs(r, c, island_id)
 * 20                      island_id += 1
 * 21          best = max(size.values(), default=0)
 * 22          for r in range(n):
 * 23              for c in range(n):
 * 24                  if grid[r][c] == 0:
 * 25                      seen = set()
 * 26                      total = 1
 * 27                      for delta_r, delta_c in [(1,0),(-1,0),(0,1),(0,-1)]:
 * 28                          next_r, next_c = r + delta_r, c + delta_c
 * 29                          if 0 <= next_r < n and 0 <= next_c < n and grid[next_r][next_c] > 1:
 * 30                              neighbor_id = grid[next_r][next_c]
 * 31                              if neighbor_id not in seen:
 * 32                                  seen.add(neighbor_id)
 * 33                                  total += size[neighbor_id]
 * 34                      best = max(best, total)
 * 35          return best
 */
function buildSteps827(input) {
  const grid = String(input).split(/[;|]/).map((row) => row.trim()).filter(Boolean)
    .map((row) => row.split(",").map((v) => Number(v.trim())));
  const steps = [];
  if (!grid.length || !grid[0].length || grid.length !== grid[0].length) {
    steps.push({
      title: { vi: "Lưới rỗng hoặc không vuông → 0", en: "Empty or non-square grid → 0" },
      arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true, codeLines: [3], vars: [{ name: "answer", value: 0 }],
      note: { vi: "Nhập lưới VUÔNG n×n gồm 0/1, dạng 1,0;0,1", en: "Enter a SQUARE n×n grid of 0/1, like 1,0;0,1" },
    });
    return { original: grid, answer: 0, steps };
  }

  const n = grid.length;
  const work = grid.map((row) => [...row]); // mutated exactly like Python's `grid`
  const size = {};
  const callStack = [];
  const stackText = () => (callStack.length ? callStack.join(" → ") : "∅");

  // flipMark: [r, c] of a water cell to render as the WINNING flip (green
  // "path" cell, label "1", meta "★flip") — used only on the final result
  // step so the viewer can see exactly where to change 0 → 1.
  function makeCells(cur, flipMark) {
    return work.map((row, r) => row.map((v, c) => {
      let cls, label, meta = v > 1 ? `#${v}` : "";
      if (flipMark && flipMark[0] === r && flipMark[1] === c) {
        cls = "path"; label = "1"; meta = "★ flip";
      } else if (v === 0) { cls = "wall"; label = "0"; }
      else if (v === 1) { cls = "empty"; label = "1"; }
      else { cls = "visited"; label = String(v); }
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      return { label, meta, cls };
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title, arr: [],
      bfsGrid: { rows: n, cols: n, cells: makeCells(o.cur || null, o.flipMark || null) },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [
        ...(o.vars || []),
        { name: "call stack", value: stackText() },
        { name: "depth", value: callStack.length },
      ],
      note: o.note,
    });
  }

  // ── Line 3-4 ────────────────────────────────────────────────────────
  snap({
    title: { vi: "n = len(grid); size = {}", en: "n = len(grid); size = {}" },
    codeLines: [3, 4],
    vars: [{ name: "n", value: n }, { name: "size", value: "{}" }],
    note: {
      vi:
        `Lưới ${n}×${n}. size[id] sẽ lưu diện tích đảo có nhãn id. ` +
        `Chiến thuật: (1) gán nhãn từng đảo bằng DFS, (2) thử lật mỗi ô nước để nối các đảo kề.`,
      en:
        `Grid ${n}×${n}. size[id] will store the area of the island labeled id. ` +
        `Strategy: (1) label every island via DFS, (2) try flipping each water cell to merge neighboring islands.`,
    },
  });

  // ── DFS definition, invoked from the labeling loop below ──────────────
  function dfs(r, c, islandId) {
    callStack.push(`dfs(${r},${c},${islandId})`);

    const oob = r < 0 || r >= n || c < 0 || c >= n;
    const notLand = !oob && work[r][c] !== 1;
    const stop = oob || notLand;
    snap({
      title: { vi: `dfs(${r},${c},${islandId}) — line 6: điều kiện dừng`, en: `dfs(${r},${c},${islandId}) — line 6: stop condition` },
      cur: oob ? null : [r, c], codeLines: [6],
      vars: [
        { name: "r, c", value: `${r}, ${c}` },
        { name: "out of bounds?", value: oob },
        { name: "grid[r][c]", value: oob ? "—" : work[r][c] },
      ],
      note: {
        vi: stop
          ? `${oob ? `(${r},${c}) ngoài lưới` : `grid[${r}][${c}]=${work[r][c]} (không phải đất 1, có thể là nước hoặc đã gán nhãn)`} → line 7 return 0.`
          : `(${r},${c}) là đất (1) chưa gán nhãn → sang line 8.`,
        en: stop
          ? `${oob ? `(${r},${c}) is out of bounds` : `grid[${r}][${c}]=${work[r][c]} (not plain land 1 — water or already labeled)`} → line 7 return 0.`
          : `(${r},${c}) is unlabeled land (1) → go to line 8.`,
      },
    });
    if (stop) {
      snap({
        title: { vi: "line 7: return 0", en: "line 7: return 0" },
        codeLines: [7], vars: [{ name: "returns", value: 0 }],
        note: { vi: "Ngoài lưới, nước, hoặc đã có nhãn → không góp diện tích.", en: "Out of bounds, water, or already labeled → contributes no area." },
      });
      callStack.pop();
      return 0;
    }

    // ── Line 8: relabel in place ────────────────────────────────────────
    const before = work.map((row) => row.join("")).join(" | ");
    work[r][c] = islandId;
    const after = work.map((row) => row.join("")).join(" | ");
    snap({
      title: { vi: `line 8: grid[${r}][${c}] = ${islandId}  ⟵ 1 bị ghi thành ${islandId}`, en: `line 8: grid[${r}][${c}] = ${islandId}  ⟵ 1 overwritten to ${islandId}` },
      cur: [r, c], codeLines: [8],
      vars: [
        { name: "grid[r][c] trước", value: 1 }, { name: "grid[r][c] sau", value: islandId },
        { name: "grid trước", value: before }, { name: "grid sau", value: after },
      ],
      note: {
        vi: `Đổi (${r},${c}) từ 1 → ${islandId} ngay trên lưới. Đây vừa là nhãn đảo, vừa là dấu "đã thăm".\ngrid: ${before}  →  ${after}`,
        en: `Change (${r},${c}) from 1 → ${islandId} in place. This doubles as both the island label and the "visited" marker.\ngrid: ${before}  →  ${after}`,
      },
    });

    // ── Line 9: area = 1 ─────────────────────────────────────────────────
    let area = 1;
    snap({
      title: { vi: "line 9: area = 1", en: "line 9: area = 1" },
      cur: [r, c], codeLines: [9], vars: [{ name: "area", value: area }],
      note: { vi: `Ô (${r},${c}) tự đóng góp 1 vào diện tích.`, en: `Cell (${r},${c}) contributes 1 to the area by itself.` },
    });

    // ── Lines 10-13: recurse in 4 directions, accumulate ─────────────────
    const DIRS = [
      { dr: 1, dc: 0, line: 10, label: "dfs(r+1, c, island_id)" },
      { dr: -1, dc: 0, line: 11, label: "dfs(r-1, c, island_id)" },
      { dr: 0, dc: 1, line: 12, label: "dfs(r, c+1, island_id)" },
      { dr: 0, dc: -1, line: 13, label: "dfs(r, c-1, island_id)" },
    ];
    for (const { dr, dc, line, label } of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      snap({
        title: { vi: `line ${line}: gọi ${label} → dfs(${nr},${nc},${islandId})`, en: `line ${line}: call ${label} → dfs(${nr},${nc},${islandId})` },
        cur: [r, c], codeLines: [line],
        vars: [{ name: "calling", value: `dfs(${nr},${nc},${islandId})` }, { name: "area so far", value: area }],
        note: { vi: `Đẩy frame dfs(${nr},${nc},${islandId}) lên call stack.`, en: `Push frame dfs(${nr},${nc},${islandId}) onto the call stack.` },
      });
      const child = dfs(nr, nc, islandId);
      area += child;
      snap({
        title: { vi: `line ${line}: area += ${child} → area = ${area}`, en: `line ${line}: area += ${child} → area = ${area}` },
        cur: [r, c], codeLines: [line],
        vars: [{ name: "returned", value: child }, { name: "area", value: area }],
        note: { vi: `Quay lại dfs(${r},${c},${islandId}). Cộng ${child} vào area → ${area}.`, en: `Back in dfs(${r},${c},${islandId}). Add ${child} to area → ${area}.` },
      });
    }

    // ── Line 14: return area ─────────────────────────────────────────────
    snap({
      title: { vi: `line 14: return ${area}`, en: `line 14: return ${area}` },
      cur: [r, c], codeLines: [14],
      vars: [{ name: "returns", value: area }],
      note: { vi: `dfs(${r},${c},${islandId}) hoàn tất, trả về diện tích ${area}.`, en: `dfs(${r},${c},${islandId}) finishes, returning area ${area}.` },
    });
    callStack.pop();
    return area;
  }

  // ── Line 15 ─────────────────────────────────────────────────────────
  let islandId = 2;
  snap({
    title: { vi: "island_id = 2", en: "island_id = 2" },
    codeLines: [15], vars: [{ name: "island_id", value: islandId }],
    note: { vi: "Nhãn đảo bắt đầu từ 2 (0=nước, 1=đất chưa gán nhãn).", en: "Island labels start at 2 (0=water, 1=unlabeled land)." },
  });

  // ── Lines 16-20: labeling loop ────────────────────────────────────────
  for (let r = 0; r < n; r++) {
    snap({
      title: { vi: `line 16: for r in range(n) → r = ${r}`, en: `line 16: for r in range(n) → r = ${r}` },
      codeLines: [16], vars: [{ name: "r", value: r }],
      note: { vi: `Quét hàng ${r} để tìm đất chưa gán nhãn.`, en: `Scan row ${r} for unlabeled land.` },
    });
    for (let c = 0; c < n; c++) {
      snap({
        title: { vi: `line 17: for c in range(n) → c = ${c}`, en: `line 17: for c in range(n) → c = ${c}` },
        cur: [r, c], codeLines: [17], vars: [{ name: "grid[r][c]", value: work[r][c] }],
        note: { vi: `Xét ô (${r},${c}) = ${work[r][c]}.`, en: `Inspect cell (${r},${c}) = ${work[r][c]}.` },
      });
      const isUnlabeledLand = work[r][c] === 1;
      snap({
        title: { vi: `line 18: grid[${r}][${c}] == 1? → ${isUnlabeledLand}`, en: `line 18: grid[${r}][${c}] == 1? → ${isUnlabeledLand}` },
        cur: [r, c], codeLines: [18], vars: [{ name: "is unlabeled land?", value: isUnlabeledLand }],
        note: {
          vi: isUnlabeledLand ? `Đất mới → gán nhãn ${islandId} ở line 19.` : `Không phải đất mới → bỏ qua.`,
          en: isUnlabeledLand ? `New land → label it ${islandId} at line 19.` : `Not new land → skip.`,
        },
      });
      if (!isUnlabeledLand) continue;
      snap({
        title: { vi: `line 19: size[${islandId}] = dfs(${r}, ${c}, ${islandId})`, en: `line 19: size[${islandId}] = dfs(${r}, ${c}, ${islandId})` },
        cur: [r, c], codeLines: [19], vars: [{ name: "island_id", value: islandId }],
        note: { vi: `Gọi DFS gốc để đo và gán nhãn toàn bộ đảo mới.`, en: `Call the root DFS to measure and label the entire new island.` },
      });
      const area = dfs(r, c, islandId);
      size[islandId] = area;
      snap({
        title: { vi: `line 19: size[${islandId}] = ${area}`, en: `line 19: size[${islandId}] = ${area}` },
        codeLines: [19],
        vars: [{ name: `size[${islandId}]`, value: area }, { name: "size", value: `{${Object.entries(size).map(([k, v]) => `${k}:${v}`).join(", ")}}` }],
        note: { vi: `DFS trả về diện tích ${area} cho đảo #${islandId}.`, en: `DFS returned area ${area} for island #${islandId}.` },
      });
      snap({
        title: { vi: `line 20: island_id += 1 → ${islandId + 1}`, en: `line 20: island_id += 1 → ${islandId + 1}` },
        codeLines: [20], vars: [{ name: "island_id", value: islandId + 1 }],
        note: { vi: "Tăng island_id cho đảo tiếp theo.", en: "Increment island_id for the next island." },
      });
      islandId += 1;
    }
  }

  // ── Line 21 ─────────────────────────────────────────────────────────
  const sizeValues = Object.values(size);
  let best = sizeValues.length ? Math.max(...sizeValues) : 0;
  let bestFlip = null; // [r, c] of the water cell that produced `best`, if any
  snap({
    title: { vi: `line 21: best = max(size.values(), default=0) = ${best}`, en: `line 21: best = max(size.values(), default=0) = ${best}` },
    codeLines: [21],
    vars: [{ name: "size", value: `{${Object.entries(size).map(([k, v]) => `${k}:${v}`).join(", ")}}` }, { name: "best", value: best }],
    note: {
      vi: `best = đảo lớn nhất hiện có = ${best}. Xử lý trường hợp lưới toàn đất (không có 0 để lật).`,
      en: `best = the largest existing island = ${best}. Covers the all-land case (no 0 to flip).`,
    },
  });

  // ── Lines 22-34: try flipping every water cell ────────────────────────
  let hasZero = false;
  for (let r = 0; r < n; r++) {
    snap({
      title: { vi: `line 22: for r in range(n) → r = ${r}`, en: `line 22: for r in range(n) → r = ${r}` },
      codeLines: [22], vars: [{ name: "r", value: r }],
      note: { vi: `Quét hàng ${r} để tìm ô nước có thể lật.`, en: `Scan row ${r} for a water cell to flip.` },
    });
    for (let c = 0; c < n; c++) {
      snap({
        title: { vi: `line 23: for c in range(n) → c = ${c}`, en: `line 23: for c in range(n) → c = ${c}` },
        cur: [r, c], codeLines: [23], vars: [{ name: "grid[r][c]", value: work[r][c] }],
        note: { vi: `Xét ô (${r},${c}).`, en: `Inspect cell (${r},${c}).` },
      });
      const isWater = work[r][c] === 0;
      snap({
        title: { vi: `line 24: grid[${r}][${c}] == 0? → ${isWater}`, en: `line 24: grid[${r}][${c}] == 0? → ${isWater}` },
        cur: [r, c], codeLines: [24], vars: [{ name: "is water?", value: isWater }],
        note: {
          vi: isWater ? `Ô nước → thử lật thành đất ở các line 25-34.` : `Không phải nước (là đảo đã gán nhãn) → bỏ qua.`,
          en: isWater ? `Water cell → try flipping it to land in lines 25-34.` : `Not water (a labeled island cell) → skip.`,
        },
      });
      if (!isWater) continue;
      hasZero = true;

      snap({
        title: { vi: "line 25-26: seen = set(); total = 1", en: "line 25-26: seen = set(); total = 1" },
        cur: [r, c], codeLines: [25, 26], vars: [{ name: "seen", value: "{}" }, { name: "total", value: 1 }],
        note: { vi: `Nếu lật (${r},${c}) thành đất, nó tự đóng góp 1. seen tránh cộng trùng cùng 1 đảo qua 2 hướng.`, en: `If (${r},${c}) is flipped to land, it contributes 1 by itself. seen avoids double-counting the same island via 2 directions.` },
      });

      const seen = new Set();
      let total = 1;
      const DIRS4 = [{ dr: 1, dc: 0, line: 27 }, { dr: -1, dc: 0, line: 27 }, { dr: 0, dc: 1, line: 27 }, { dr: 0, dc: -1, line: 27 }];
      for (const { dr, dc } of DIRS4) {
        const nr = r + dr;
        const nc = c + dc;
        snap({
          title: { vi: `line 27-28: next_r, next_c = (${nr}, ${nc})`, en: `line 27-28: next_r, next_c = (${nr}, ${nc})` },
          cur: [r, c], codeLines: [27, 28], vars: [{ name: "next_r, next_c", value: `${nr}, ${nc}` }],
          note: { vi: `Xét hàng xóm (${nr},${nc}).`, en: `Check neighbor (${nr},${nc}).` },
        });
        const inBounds = nr >= 0 && nr < n && nc >= 0 && nc < n;
        const isIslandCell = inBounds && work[nr][nc] > 1;
        snap({
          title: { vi: `line 29: trong lưới AND grid[next]>1 → ${isIslandCell}`, en: `line 29: in bounds AND grid[next]>1 → ${isIslandCell}` },
          cur: [r, c], codeLines: [29],
          vars: [{ name: "in bounds?", value: inBounds }, { name: "grid[next_r][next_c]", value: inBounds ? work[nr][nc] : "—" }],
          note: {
            vi: isIslandCell ? `(${nr},${nc}) là ô đảo đã gán nhãn ${work[nr][nc]} → sang line 30.` : `Ngoài lưới hoặc là nước → bỏ qua.`,
            en: isIslandCell ? `(${nr},${nc}) is a labeled island cell ${work[nr][nc]} → go to line 30.` : `Out of bounds or water → skip.`,
          },
        });
        if (!isIslandCell) continue;
        const neighborId = work[nr][nc];
        snap({
          title: { vi: `line 30: neighbor_id = grid[${nr}][${nc}] = ${neighborId}`, en: `line 30: neighbor_id = grid[${nr}][${nc}] = ${neighborId}` },
          cur: [nr, nc], codeLines: [30], vars: [{ name: "neighbor_id", value: neighborId }],
          note: { vi: `Đảo kề có nhãn ${neighborId}.`, en: `The neighboring island has label ${neighborId}.` },
        });
        const isNewSeen = !seen.has(neighborId);
        snap({
          title: { vi: `line 31: ${neighborId} not in seen → ${isNewSeen}`, en: `line 31: ${neighborId} not in seen → ${isNewSeen}` },
          cur: [nr, nc], codeLines: [31], vars: [{ name: "seen", value: `{${[...seen].join(",")}}` }, { name: "is new?", value: isNewSeen }],
          note: {
            vi: isNewSeen ? `Đảo ${neighborId} CHƯA được cộng → sang line 32-33 để cộng vào total.` : `Đảo ${neighborId} ĐÃ được cộng rồi (có thể gặp lại qua hướng khác) → bỏ qua, tránh đếm trùng.`,
            en: isNewSeen ? `Island ${neighborId} has NOT been added yet → go to lines 32-33 to add it to total.` : `Island ${neighborId} was ALREADY added (reached via another direction) → skip to avoid double-counting.`,
          },
        });
        if (!isNewSeen) continue;
        seen.add(neighborId);
        total += size[neighborId];
        snap({
          title: { vi: `line 32-33: seen.add(${neighborId}); total += ${size[neighborId]} → ${total}`, en: `line 32-33: seen.add(${neighborId}); total += ${size[neighborId]} → ${total}` },
          cur: [nr, nc], codeLines: [32, 33],
          vars: [{ name: "seen", value: `{${[...seen].join(",")}}` }, { name: "total", value: total }],
          note: { vi: `Cộng kích thước đảo ${neighborId} (=${size[neighborId]}) vào total → ${total}.`, en: `Add island ${neighborId}'s size (${size[neighborId]}) to total → ${total}.` },
        });
      }

      const improved = total > best;
      if (improved) { best = total; bestFlip = [r, c]; }
      snap({
        title: { vi: `line 34: best = max(${improved ? total - 0 : best}, ${total}) → ${best}`, en: `line 34: best = max(best, ${total}) → ${best}` },
        cur: [r, c], codeLines: [34],
        vars: [{ name: "flip cell", value: `(${r},${c})` }, { name: "total", value: total }, { name: "best", value: best }, { name: "best flip cell", value: bestFlip ? `(${bestFlip[0]},${bestFlip[1]})` : "none" }],
        note: {
          vi: improved
            ? `Lật (${r},${c}) cho tổng ${total} (đất mới + các đảo kề khác nhau), lớn hơn best cũ → best = ${best}. Đây là vị trí lật tốt nhất tính đến giờ.`
            : `Lật (${r},${c}) cho tổng ${total}, không vượt best hiện tại = ${best}.`,
          en: improved
            ? `Flipping (${r},${c}) gives total ${total} (new land + distinct neighboring islands), beating the old best → best = ${best}. This is the best flip position so far.`
            : `Flipping (${r},${c}) gives total ${total}, which doesn't beat the current best = ${best}.`,
        },
      });
    }
  }

  // ── Line 35 ─────────────────────────────────────────────────────────
  snap({
    title: {
      vi: bestFlip ? `line 35: return ${best} — lật (${bestFlip[0]},${bestFlip[1]}) từ 0 → 1` : `line 35: return ${best}`,
      en: bestFlip ? `line 35: return ${best} — flip (${bestFlip[0]},${bestFlip[1]}) from 0 → 1` : `line 35: return ${best}`,
    },
    final: true, codeLines: [35],
    flipMark: bestFlip,
    vars: [
      { name: "answer", value: best },
      { name: "best flip position", value: bestFlip ? `(${bestFlip[0]},${bestFlip[1]})` : "none needed" },
    ],
    note: {
      vi: bestFlip
        ? `Đã thử lật mọi ô nước. VỊ TRÍ TỐT NHẤT để đổi 0 → 1 là (${bestFlip[0]},${bestFlip[1]}) (đánh dấu ★ xanh trên lưới), cho đảo lớn nhất = ${best}.`
        : hasZero
          ? `Không ô nước nào cải thiện được kích thước đảo lớn nhất hiện có → giữ nguyên, không cần lật. best = ${best}.`
          : `Lưới toàn đất, không có ô nước để lật → đáp án = đảo lớn nhất hiện có = ${best}.`,
      en: bestFlip
        ? `Tried flipping every water cell. The BEST position to change 0 → 1 is (${bestFlip[0]},${bestFlip[1]}) (marked ★ green on the grid), producing the largest island = ${best}.`
        : hasZero
          ? `No water cell improved on the existing largest island → no flip needed. best = ${best}.`
          : `The grid is all land, no water to flip → the answer is the largest existing island = ${best}.`,
    },
  });

  return { original: grid, answer: best, steps };
}

/**
 * LeetCode 210: Course Schedule II — Kahn's topological sort, return an order.
 * Code lines (1-indexed):
 *  1  from collections import defaultdict, deque
 *  2  class Solution:
 *  3      def findOrder(self, numCourses, prerequisites):
 *  4          graph = defaultdict(list); indegree = [0]*numCourses
 *  5          for course, prereq in prerequisites: graph[prereq].append(course); indegree[course]+=1
 *  6          queue = deque([c for c in range(numCourses) if indegree[c]==0])
 *  7          order = []
 *  8          while queue:
 *  9              course = queue.popleft(); order.append(course)
 * 10              for nxt in graph[course]:
 * 11                  indegree[nxt]-=1
 * 12                  if indegree[nxt]==0: queue.append(nxt)
 * 13          return order if len(order)==numCourses else []
 */
function buildSteps210(input, params) {
  const numCourses = params && params.n !== undefined ? Number(params.n) : 4;
  const prereqs = String(input).split(",").map((p) => p.trim()).filter(Boolean).map((p) => p.split("-").map(Number));

  const steps = [];
  const graph = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, prereq] of prereqs) {
    graph[prereq].push(course);
    indegree[course] += 1;
  }

  const nodes = () => Array.from({ length: numCourses }, (_, id) => ({ id, label: String(id), dist: `in:${indegree[id]}` }));
  const edges = prereqs.map(([course, prereq]) => ({ u: prereq, v: course }));
  const indStr = () => `[${indegree.join(", ")}]`;

  function gsnap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      graph: { nodes: nodes(), edges, hlNodes: opts.hlNodes || [], hlEdges: opts.hlEdges || [], visitedNodes: opts.visited || [], annotations: {} },
      highlight: [], mark: [], final: opts.final || false,
      codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  gsnap({
    title: { vi: "Xây graph & indegree", en: "Build graph & indegree" },
    codeLines: [4, 5],
    vars: [{ name: "numCourses", value: numCourses }, { name: "indegree", value: indStr() }],
    note: {
      vi: `Cạnh prereq → course (phải học prereq trước). indegree[c] = số môn phải học trước c. Nhãn node = "in:indegree".\nTopo sort Kahn: lấy dần các môn indegree=0.`,
      en: `Edge prereq → course (prereq must come first). indegree[c] = number of prerequisites of c. Node label = "in:indegree".\nKahn's topo sort: repeatedly take courses with indegree=0.`,
    },
  });

  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);
  const order = [];
  const visited = [];

  gsnap({
    title: { vi: `queue ban đầu = [${queue.join(", ")}]`, en: `initial queue = [${queue.join(", ")}]` },
    hlNodes: [...queue],
    codeLines: [6, 7],
    vars: [{ name: "queue", value: `[${queue.join(", ")}]` }, { name: "indegree", value: indStr() }],
    note: { vi: `Đưa mọi môn có indegree=0 (không cần học trước) vào queue.`, en: `Enqueue all courses with indegree=0 (no prerequisites).` },
  });

  let head = 0;
  while (head < queue.length) {
    const course = queue[head++];
    order.push(course);
    visited.push(course);
    gsnap({
      title: { vi: `Học môn ${course} → order=[${order.join(", ")}]`, en: `Take course ${course} → order=[${order.join(", ")}]` },
      hlNodes: [course], visited: [...visited],
      codeLines: [8, 9],
      vars: [{ name: "course", value: course }, { name: "order", value: `[${order.join(", ")}]` } ],
      note: { vi: `Lấy môn ${course} khỏi queue, thêm vào order. Giảm indegree các môn phụ thuộc.`, en: `Pop course ${course}, append to order. Decrement indegree of dependents.` },
    });
    for (const nxt of graph[course]) {
      indegree[nxt] -= 1;
      const ready = indegree[nxt] === 0;
      if (ready) queue.push(nxt);
      gsnap({
        title: { vi: `indegree[${nxt}] → ${indegree[nxt]}${ready ? " → vào queue" : ""}`, en: `indegree[${nxt}] → ${indegree[nxt]}${ready ? " → enqueue" : ""}` },
        hlNodes: [course, nxt], hlEdges: [[course, nxt]], visited: [...visited],
        codeLines: [10, 11, 12],
        vars: [{ name: `indegree[${nxt}]`, value: indegree[nxt] }, { name: "queue", value: `[${queue.slice(head).join(", ")}]` }],
        note: {
          vi: ready ? `Học xong ${course} → indegree[${nxt}]=0 → sẵn sàng, thêm vào queue.` : `indegree[${nxt}]=${indegree[nxt]} (còn môn phải học trước).`,
          en: ready ? `After ${course}, indegree[${nxt}]=0 → ready, enqueue.` : `indegree[${nxt}]=${indegree[nxt]} (still has prerequisites).`,
        },
      });
    }
  }

  const answer = order.length === numCourses ? order : [];
  gsnap({
    title: answer.length ? { vi: `Kết quả: [${order.join(", ")}]`, en: `Result: [${order.join(", ")}]` } : { vi: "Có chu trình → []", en: "Cycle → []" },
    visited: [...visited], final: true,
    codeLines: [13],
    vars: [{ name: "order length", value: order.length }, { name: "answer", value: `[${answer.join(", ")}]` }],
    note: {
      vi: answer.length ? `Học đủ ${numCourses} môn theo thứ tự [${order.join(", ")}].` : `Chỉ xếp được ${order.length}/${numCourses} môn → tồn tại chu trình → [].`,
      en: answer.length ? `All ${numCourses} courses ordered as [${order.join(", ")}].` : `Only ${order.length}/${numCourses} courses ordered → a cycle exists → [].`,
    },
  });

  return { original: prereqs, answer, steps };
}

/**
 * LeetCode 399: Evaluate Division — weighted graph, DFS per query.
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def calcEquation(self, equations, values, queries):
 *  3          graph[a][b] = v; graph[b][a] = 1/v
 *  4          def dfs(src, dst, visited):
 *  5              if src or dst not in graph: return -1
 *  6              if src == dst: return 1
 *  7              visited.add(src)
 *  8              for nei, w in graph[src].items():
 *  9                  if nei not in visited:
 * 10                      r = dfs(nei, dst, visited)
 * 11                      if r != -1: return w * r
 * 12              return -1
 * 13          return [dfs(a, b, set()) for a, b in queries]
 */
function buildSteps399(input, params) {
  // equations: "a/b,b/c" ; values: "2,3" ; queries: "a/c,b/a,a/e,x/x"
  const equations = String(input).split(",").map((e) => e.trim()).filter(Boolean).map((e) => e.split("/"));
  const values = String(params && params.values || "2,3").split(",").map((v) => Number(v.trim()));
  const queries = String(params && params.queries || "a/c,b/a,a/e,x/x").split(",").map((q) => q.trim()).filter(Boolean).map((q) => q.split("/"));

  const steps = [];
  const graph = {};
  const addEdge = (a, b, w) => { (graph[a] = graph[a] || {})[b] = w; };
  equations.forEach(([a, b], i) => { addEdge(a, b, values[i]); addEdge(b, a, 1 / values[i]); });

  const allVars = [...new Set(equations.flat())].sort();
  const nodes = () => allVars.map((v) => ({ id: v, label: v, dist: "" }));
  const edgeList = [];
  equations.forEach(([a, b], i) => edgeList.push({ u: a, v: b, w: String(values[i]) }));

  function gsnap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      graph: { nodes: nodes(), edges: edgeList, hlNodes: opts.hlNodes || [], hlEdges: opts.hlEdges || [], visitedNodes: opts.visited || [], annotations: {} },
      highlight: [], mark: [], final: opts.final || false,
      codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  gsnap({
    title: { vi: "Xây đồ thị có trọng số", en: "Build the weighted graph" },
    codeLines: [3],
    vars: [{ name: "equations", value: equations.map(([a, b], i) => `${a}/${b}=${values[i]}`).join(", ") }],
    note: {
      vi: `Cạnh a → b trọng số a/b; b → a trọng số 1/(a/b). Nhân trọng số dọc đường đi = tỉ số cần tính.\nMỗi query a/b: DFS từ a tới b, nhân các cạnh.`,
      en: `Edge a → b with weight a/b; b → a with weight 1/(a/b). Multiplying weights along a path = the ratio.\nEach query a/b: DFS from a to b, multiplying edges.`,
    },
  });

  const answers = [];
  for (const [a, b] of queries) {
    const visited = new Set();
    let result = -1;
    const pathEdges = [];

    function dfs(src, dst) {
      if (!(src in graph) || !(dst in graph)) return -1;
      if (src === dst) return 1;
      visited.add(src);
      for (const [nei, w] of Object.entries(graph[src])) {
        if (!visited.has(nei)) {
          const r = dfs(nei, dst);
          if (r !== -1) { pathEdges.push([src, nei]); return w * r; }
        }
      }
      return -1;
    }
    result = dfs(a, b);
    answers.push(result);

    gsnap({
      title: { vi: `Query ${a}/${b} = ${result === -1 ? "-1" : +result.toFixed(4)}`, en: `Query ${a}/${b} = ${result === -1 ? "-1" : +result.toFixed(4)}` },
      hlNodes: (a in graph && b in graph) ? [a, b] : [],
      hlEdges: pathEdges.map(([u, v]) => [u, v]),
      visited: [...visited],
      codeLines: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      vars: [
        { name: "query", value: `${a}/${b}` },
        { name: "result", value: result === -1 ? -1 : +result.toFixed(4) },
        { name: "answers", value: `[${answers.map((x) => x === -1 ? -1 : +x.toFixed(2)).join(", ")}]` },
      ],
      note: {
        vi: result === -1
          ? ((a in graph && b in graph) ? `Không có đường từ ${a} tới ${b} → -1.` : `${!(a in graph) ? a : b} không có trong đồ thị → -1.`)
          : `DFS từ ${a} tới ${b}, nhân trọng số các cạnh trên đường đi = ${+result.toFixed(4)}.`,
        en: result === -1
          ? ((a in graph && b in graph) ? `No path from ${a} to ${b} → -1.` : `${!(a in graph) ? a : b} is not in the graph → -1.`)
          : `DFS from ${a} to ${b}, multiply edge weights along the path = ${+result.toFixed(4)}.`,
      },
    });
  }

  gsnap({
    title: { vi: `Kết quả: [${answers.map((x) => x === -1 ? -1 : +x.toFixed(2)).join(", ")}]`, en: `Result: [${answers.map((x) => x === -1 ? -1 : +x.toFixed(2)).join(", ")}]` },
    final: true, codeLines: [13],
    vars: [{ name: "answer", value: `[${answers.map((x) => x === -1 ? -1 : +x.toFixed(2)).join(", ")}]` }],
    note: { vi: `Trả lời từng query bằng cách nhân trọng số dọc đường đi trong đồ thị.`, en: `Answer each query by multiplying edge weights along the graph path.` },
  });

  return { original: equations, answer: answers, steps };
}

/**
 * LeetCode 851 — Loud and Rich, Approach 2: Kahn's BFS (topological sort).
 * Build the ORIGINAL richer graph (a → b means a is richer than b).
 * Nodes with in-degree 0 have no one richer than them → start the queue.
 * Propagate the quietest known person DOWN the richer-than edges.
 */
function buildSteps851v2(input, params = {}) {
  const richerRaw = String(input).split(",").map((e) => e.trim()).filter(Boolean);
  const quiet = String(params.quiet || "")
    .split(",")
    .map((v) => parseInt(v.trim(), 10))
    .filter(Number.isFinite);
  const n = quiet.length;
  const steps = [];

  // Build forward graph  a → b (a richer than b)  +  track in-degree
  const graph = Array.from({ length: n }, () => []);  // graph[a] = [list of poorer people]
  const indegree = new Array(n).fill(0);
  const richerEdges = richerRaw.map((e) => {
    const [a, b] = e.split("-").map(Number);
    return { a, b };
  }).filter((e) => Number.isInteger(e.a) && Number.isInteger(e.b) && e.a >= 0 && e.a < n && e.b >= 0 && e.b < n);

  for (const { a, b } of richerEdges) {
    graph[a].push(b);
    indegree[b]++;
  }

  const answer = Array.from({ length: n }, (_, i) => i);  // answer[i] = i initially
  const inQueue = new Set();
  const processed = new Set();

  function snap(title, note, codeLines, hl = [], mk = [], extra = {}, final = false) {
    steps.push({
      title, note, codeLines, codeBlock: 2, arr: [], highlight: hl, mark: mk, final,
      vars: [
        { name: "answer", value: `[${answer.join(", ")}]` },
        { name: "indegree", value: `[${indegree.join(", ")}]` },
        ...(extra.vars || []),
      ],
      loudRichV2: {
        n, quiet: [...quiet],
        richerEdges,
        graph: graph.map((nb) => [...nb]),
        answer: [...answer],
        indegree: [...indegree],
        inQueue: [...inQueue],
        processed: [...processed],
        ...(extra.view || {}),
      },
    });
  }

  snap(
    { vi: "Khởi tạo đồ thị + indegree", en: "Build graph + indegree" },
    { vi: `Dựng đồ thị hướng a→b (a giàu hơn b) và mảng indegree. indegree[i] = số người giàu hơn i trực tiếp. answer[i] = i ban đầu (mỗi người tự đại diện cho chính mình).`, en: `Build directed graph a→b (a richer than b) and the indegree array. indegree[i] = number of people directly richer than i. answer[i] = i initially (each person represents themselves).` },
    [3, 4, 5, 6, 7],
  );

  // Fill queue with in-degree 0 nodes
  const queue = [];
  for (let i = 0; i < n; i++) {
    if (indegree[i] === 0) { queue.push(i); inQueue.add(i); }
  }
  snap(
    { vi: "Nạp các nút có indegree = 0 vào queue", en: "Enqueue all nodes with indegree = 0" },
    { vi: `Các nút indegree=0 là những người KHÔNG có ai giàu hơn trực tiếp → xuất phát điểm của BFS. Queue = [${queue.join(", ")}].`, en: `Nodes with indegree=0 have no one directly richer than them → BFS starting points. Queue = [${queue.join(", ")}].` },
    [8, 9, 10],
    [], [], { vars: [{ name: "queue", value: `[${queue.join(", ")}]` }] },
  );

  let head = 0;  // queue pointer (simulate deque.popleft)
  while (head < queue.length) {
    const u = queue[head++];
    inQueue.delete(u);
    processed.add(u);

    snap(
      { vi: `Lấy u = ${u} từ queue`, en: `Dequeue u = ${u}` },
      { vi: `u=${u}: answer[${u}]=${answer[u]} (người ít ồn nhất trong nhóm giàu hơn hoặc bằng ${u} đã biết). Xét tất cả v mà ${u} giàu hơn.`, en: `u=${u}: answer[${u}]=${answer[u]} (the quietest person at least as rich as ${u} known so far). Process every v poorer than ${u}.` },
      [11, 12],
      [u], [],
      { vars: [{ name: "u", value: u }, { name: "answer[u]", value: answer[u] }, { name: "quiet[answer[u]]", value: quiet[answer[u]] }], view: { activeU: u } },
    );

    for (const v of graph[u]) {
      const oldBest = answer[v];
      const candidateBest = answer[u];
      const update = quiet[candidateBest] < quiet[oldBest];

      snap(
        {
          vi: update
            ? `quiet[answer[${u}]]=${quiet[candidateBest]} < quiet[answer[${v}]]=${quiet[oldBest]} → cập nhật answer[${v}]`
            : `quiet[answer[${u}]]=${quiet[candidateBest]} >= quiet[answer[${v}]]=${quiet[oldBest]} → giữ nguyên`,
          en: update
            ? `quiet[answer[${u}]]=${quiet[candidateBest]} < quiet[answer[${v}]]=${quiet[oldBest]} → update answer[${v}]`
            : `quiet[answer[${u}]]=${quiet[candidateBest]} >= quiet[answer[${v}]]=${quiet[oldBest]} → keep`,
        },
        {
          vi: update
            ? `Người ít ồn nhất bên phía giàu hơn của ${u} (= người ${candidateBest}, quiet=${quiet[candidateBest]}) ít ồn hơn best hiện tại của ${v} (người ${oldBest}, quiet=${quiet[oldBest]}) → answer[${v}] = ${candidateBest}.`
            : `Best hiện tại của ${v} (người ${oldBest}, quiet=${quiet[oldBest]}) ít ồn bằng hoặc hơn candidate từ ${u} → giữ answer[${v}] = ${oldBest}.`,
          en: update
            ? `The quietest person at least as rich as ${u} (person ${candidateBest}, quiet=${quiet[candidateBest]}) is quieter than ${v}'s current best (person ${oldBest}, quiet=${quiet[oldBest]}) → answer[${v}] = ${candidateBest}.`
            : `${v}'s current best (person ${oldBest}, quiet=${quiet[oldBest]}) is equal or quieter than the candidate from ${u} → keep answer[${v}] = ${oldBest}.`,
        },
        update ? [13, 14, 15] : [13, 14],
        [u, v], [],
        { vars: [{ name: "u", value: u }, { name: "v", value: v }, { name: "answer[u]", value: candidateBest }, { name: "quiet[answer[u]]", value: quiet[candidateBest] }, { name: "answer[v] (before)", value: oldBest }, { name: "update?", value: update }], view: { activeU: u, activeV: v } },
      );

      if (update) answer[v] = answer[u];

      indegree[v]--;
      const enqueue = indegree[v] === 0;
      if (enqueue) { queue.push(v); inQueue.add(v); }

      snap(
        {
          vi: enqueue ? `indegree[${v}]-- = 0 → enqueue ${v}` : `indegree[${v}]-- = ${indegree[v]}`,
          en: enqueue ? `indegree[${v}]-- = 0 → enqueue ${v}` : `indegree[${v}]-- = ${indegree[v]}`,
        },
        {
          vi: enqueue
            ? `Giảm indegree[${v}] về 0 → mọi người giàu hơn ${v} đã được xử lý → đẩy ${v} vào queue. Queue = [${queue.slice(head).join(", ")}].`
            : `Giảm indegree[${v}] về ${indegree[v]} → còn ${indegree[v]} người giàu hơn ${v} chưa xử lý.`,
          en: enqueue
            ? `Decrement indegree[${v}] to 0 → all people richer than ${v} have been processed → enqueue ${v}. Queue = [${queue.slice(head).join(", ")}].`
            : `Decrement indegree[${v}] to ${indegree[v]} → still ${indegree[v]} people richer than ${v} unprocessed.`,
        },
        [16, 17, 18],
        [v], [],
        { vars: [{ name: "v", value: v }, { name: "answer[v]", value: answer[v] }, { name: "indegree[v]", value: indegree[v] }, { name: "enqueue?", value: enqueue }], view: { activeU: u, activeV: v } },
      );
    }
  }

  snap(
    { vi: "Kết quả", en: "Result" },
    { vi: `answer = [${answer.join(", ")}]. Với mỗi người i, answer[i] là người ít ồn nhất giàu hơn hoặc bằng i.`, en: `answer = [${answer.join(", ")}]. For each person i, answer[i] is the least quiet person at least as rich as i.` },
    [19],
    [], [], {}, true,
  );

  return { original: { richer: richerEdges, quiet }, answer, steps };
}

/**
 * LeetCode 4003: Minimum Cost Path with Alternating Directions III.
 *
 * Dijkstra on state (r, c, parity) where parity ∈ {0=even, 1=odd}.
 * Parity 1 (odd action): right/down follows the rule → no penalty.
 * Parity 0 (even action): left/up follows the rule → no penalty.
 *
 * Three choices each turn:
 *   1. Move following parity  → dest entry cost only.
 *   2. Move violating parity  → dest entry cost + penalty[r][c].
 *   3. Wait in current cell   → penalty[r][c], parity flips.
 *
 * Code lines (1-indexed):
 *  1  import heapq
 *  2  class Solution:
 *  3      def minCost(self, m, n, penalty):
 *  4          INF = float('inf')
 *  5          dist = [[[INF]*2 for _ in range(n)] for _ in range(m)]
 *  6          dist[0][0][1] = (0+1)*(0+1)
 *  7          heap = [(dist[0][0][1], 0, 0, 1)]
 *  8          while heap:
 *  9              cost, r, c, par = heapq.heappop(heap)
 * 10              if cost > dist[r][c][par]: continue
 * 11              if r == m-1 and c == n-1: return cost
 * 12              for dr, dc in [(0,1),(1,0),(0,-1),(-1,0)]:
 * 13                  nr, nc = r+dr, c+dc
 * 14                  if 0 <= nr < m and 0 <= nc < n:
 * 15                      follows = (par==1 and dr+dc>0) or (par==0 and dr+dc<0)
 * 16                      pen = 0 if follows else penalty[r][c]
 * 17                      nc_cost = cost + (nr+1)*(nc+1) + pen
 * 18                      if nc_cost < dist[nr][nc][1-par]:
 * 19                          dist[nr][nc][1-par] = nc_cost
 * 20                          heapq.heappush(heap, (nc_cost, nr, nc, 1-par))
 * 21              wait_cost = cost + penalty[r][c]
 * 22              if wait_cost < dist[r][c][1-par]:
 * 23                  dist[r][c][1-par] = wait_cost
 * 24                  heapq.heappush(heap, (wait_cost, r, c, 1-par))
 * 25          return min(dist[m-1][n-1])
 */
function buildSteps4003(input, params) {
  // Parse penalty matrix: rows separated by ';', values by ','
  let penalty;
  const raw = String(input || "").trim();
  if (raw.includes(";")) {
    penalty = raw.split(";").map((row) => row.split(",").map(Number));
  } else {
    penalty = [[1, 2], [3, 4]]; // fallback
  }
  const m = penalty.length;
  const n = penalty[0].length;
  const steps = [];
  const INF = Infinity;
  const entry = (r, c) => (r + 1) * (c + 1);
  const fmt = (v) => (Number.isFinite(v) ? String(v) : "∞");

  // dist[r][c][par] — par 1=odd, 0=even
  const dist = Array.from({ length: m }, () =>
    Array.from({ length: n }, () => [INF, INF])
  );
  const settled = new Set(); // "r,c,par" keys
  const heapArr = []; // min-heap simulated as sorted array (small grids)
  const push = (el) => { heapArr.push(el); heapArr.sort((a, b) => a[0] - b[0]); };
  const pop = () => heapArr.shift();
  const key = (r, c, p) => `${r},${c},${p}`;

  function makeCells(curR, curC, curP) {
    return Array.from({ length: m }, (_, r) =>
      Array.from({ length: n }, (_, c) => {
        const isStart = r === 0 && c === 0;
        const isEnd = r === m - 1 && c === n - 1;
        const dOdd = fmt(dist[r][c][1]);
        const dEven = fmt(dist[r][c][0]);
        let cls = "empty";
        if (settled.has(key(r, c, 0)) || settled.has(key(r, c, 1))) cls = "visited";
        if (r === curR && c === curC) cls = "current";
        if (isEnd && cls === "visited") cls = "path";
        const label = `(${r},${c})\ne:${entry(r, c)}`;
        const metaSuffix = isStart ? " S" : isEnd ? " T" : "";
        const meta = `o:${dOdd} e:${dEven} p:${penalty[r][c]}${metaSuffix}`;
        return { label, meta, cls };
      })
    );
  }

  function snap(title, note, codeLines, vars = [], curR = null, curC = null, curP = null, final = false) {
    steps.push({
      title, note, codeLines, arr: [], highlight: [], mark: [], final,
      vars: [
        ...vars,
        { name: "heap size", value: heapArr.length },
      ],
      bfsGrid: {
        rows: m, cols: n,
        variant: "effort-grid",
        cells: makeCells(curR, curC, curP),
      },
    });
  }

  snap(
    { vi: `Grid ${m}×${n}: entry cost = (r+1)(c+1), penalty[][]`, en: `Grid ${m}×${n}: entry cost = (r+1)(c+1), penalty[][]` },
    {
      vi: `Mỗi ô (r,c): chi phí vào = (r+1)×(c+1). Mỗi hành động có parity (lẻ/chẵn):\n` +
          `• Parity LẺ: đi phải/xuống → không phạt.\n• Parity CHẴN: đi trái/lên → không phạt.\n` +
          `• Vi phạm hoặc đứng chờ → cộng penalty[r][c].\n` +
          `Ô hiển thị: o=chi phí parity lẻ, e=parity chẵn, p=penalty.`,
      en: `Each cell (r,c): entry cost = (r+1)×(c+1). Each action has a parity (odd/even):\n` +
          `• Odd parity: move right/down → no penalty.\n• Even parity: move left/up → no penalty.\n` +
          `• Violating or waiting → add penalty[r][c].\n` +
          `Cell labels: o=cost at odd parity, e=at even parity, p=penalty.`,
    },
    [3, 4, 5, 6, 7],
    [{ name: "m", value: m }, { name: "n", value: n }, { name: "penalty", value: penalty.map((r) => `[${r.join(",")}]`).join(" ") }],
  );

  // Init
  dist[0][0][1] = entry(0, 0);
  push([dist[0][0][1], 0, 0, 1]);
  snap(
    { vi: `dist[0][0][odd] = entry(0,0) = ${entry(0, 0)}`, en: `dist[0][0][odd] = entry(0,0) = ${entry(0, 0)}` },
    {
      vi: `Xuất phát tại (0,0) với parity LẺ (action 1). Chi phí bắt đầu = (0+1)×(0+1) = ${entry(0, 0)}.`,
      en: `Start at (0,0) with ODD parity (action 1). Initial cost = (0+1)×(0+1) = ${entry(0, 0)}.`,
    },
    [5, 6, 7],
    [{ name: "dist[0][0][odd]", value: dist[0][0][1] }],
    0, 0, 1,
  );

  let guard = 0;
  while (heapArr.length > 0 && guard++ < 300) {
    const [cost, r, c, par] = pop();
    if (cost > dist[r][c][par]) continue;
    if (settled.has(key(r, c, par))) continue;
    settled.add(key(r, c, par));

    const parName = par === 1 ? "odd" : "even";
    snap(
      { vi: `Lấy (${r},${c}) parity=${parName}, cost=${cost}`, en: `Pop (${r},${c}) parity=${parName}, cost=${cost}` },
      {
        vi: `Lấy ô tối ưu (${r},${c}) với parity ${parName} và cost=${cost} ra khỏi heap. Xét tất cả các hành động.`,
        en: `Extract optimal cell (${r},${c}) at parity ${parName} with cost=${cost} from heap. Explore all actions.`,
      },
      [8, 9, 10],
      [{ name: "r,c", value: `${r},${c}` }, { name: "parity", value: parName }, { name: "cost", value: cost }],
      r, c, par,
    );

    if (r === m - 1 && c === n - 1) {
      snap(
        { vi: `Đến đích (${r},${c})! cost = ${cost}`, en: `Reached (${r},${c})! cost = ${cost}` },
        { vi: `Đã tới đích (${m - 1},${n - 1}) với chi phí tối thiểu = ${cost}.`, en: `Reached destination (${m - 1},${n - 1}) with minimum cost = ${cost}.` },
        [11],
        [{ name: "answer", value: cost }],
        r, c, par, true,
      );
      return { original: { m, n, penalty }, answer: cost, steps };
    }

    // Explore 4 neighbors
    const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const DIR_NAMES = ["→ right", "↓ down", "← left", "↑ up"];
    for (let d = 0; d < 4; d++) {
      const [dr, dc] = DIRS[d];
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
      const follows = (par === 1 && dr + dc > 0) || (par === 0 && dr + dc < 0);
      const pen = follows ? 0 : penalty[r][c];
      const newCost = cost + entry(nr, nc) + pen;
      const np = 1 - par;
      const npName = np === 1 ? "odd" : "even";
      const improved = newCost < dist[nr][nc][np];
      if (improved) dist[nr][nc][np] = newCost;

      snap(
        {
          vi: `${DIR_NAMES[d]}: (${nr},${nc}) parity=${npName}, cost=${newCost}${improved ? " ✓" : " (không cải thiện)"}`,
          en: `${DIR_NAMES[d]}: (${nr},${nc}) parity=${npName}, cost=${newCost}${improved ? " ✓" : " (no improvement)"}`,
        },
        {
          vi: follows
            ? `Đi ${DIR_NAMES[d]} → đúng parity → không phạt. chi phí = ${cost} + entry(${nr},${nc})=${entry(nr, nc)} = ${newCost}.`
            : `Đi ${DIR_NAMES[d]} → SAI parity → phạt penalty[${r}][${c}]=${penalty[r][c]}. chi phí = ${cost} + ${entry(nr, nc)} + ${penalty[r][c]} = ${newCost}.`,
          en: follows
            ? `Move ${DIR_NAMES[d]} → follows parity → no penalty. cost = ${cost} + entry(${nr},${nc})=${entry(nr, nc)} = ${newCost}.`
            : `Move ${DIR_NAMES[d]} → VIOLATES parity → add penalty[${r}][${c}]=${penalty[r][c]}. cost = ${cost} + ${entry(nr, nc)} + ${penalty[r][c]} = ${newCost}.`,
        },
        follows ? [12, 13, 14, 15, 16, 17, 18] : [12, 13, 14, 15, 16, 17, 18, 19, 20],
        [
          { name: "direction", value: DIR_NAMES[d] },
          { name: "follows parity?", value: follows },
          { name: "penalty", value: pen },
          { name: "new cost", value: newCost },
          { name: "improved?", value: improved },
        ],
        r, c, par,
      );

      if (improved) push([newCost, nr, nc, np]);
    }

    // Wait
    const waitCost = cost + penalty[r][c];
    const np = 1 - par;
    const npName = np === 1 ? "odd" : "even";
    const improved = waitCost < dist[r][c][np];
    if (improved) dist[r][c][np] = waitCost;

    snap(
      {
        vi: `Chờ tại (${r},${c}): parity → ${npName}, cost=${waitCost}${improved ? " ✓" : " (không cải thiện)"}`,
        en: `Wait at (${r},${c}): parity → ${npName}, cost=${waitCost}${improved ? " ✓" : " (no improvement)"}`,
      },
      {
        vi: `Đứng chờ → trả penalty[${r}][${c}]=${penalty[r][c]}. cost = ${cost} + ${penalty[r][c]} = ${waitCost}. Parity đổi → ${npName}.`,
        en: `Wait → pay penalty[${r}][${c}]=${penalty[r][c]}. cost = ${cost} + ${penalty[r][c]} = ${waitCost}. Parity flips → ${npName}.`,
      },
      [21, 22, 23, 24],
      [
        { name: "wait penalty", value: penalty[r][c] },
        { name: "wait cost", value: waitCost },
        { name: "improved?", value: improved },
      ],
      r, c, par,
    );

    if (improved) push([waitCost, r, c, np]);
  }

  const answer = Math.min(...dist[m - 1][n - 1]);
  snap(
    { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    { vi: `Chi phí tối thiểu = ${answer}.`, en: `Minimum cost = ${answer}.` },
    [25],
    [{ name: "answer", value: answer }],
    m - 1, n - 1, null, true,
  );
  return { original: { m, n, penalty }, answer, steps };
}

/**
 * LeetCode 1245: Tree Diameter — double BFS.
 *
 * 1. BFS from any node (0) to find a farthest node A.
 * 2. BFS from A to find the farthest node B and the distance — that
 *    distance is the tree diameter (longest path, measured in edges).
 * Works because in a tree, one endpoint of the diameter is always the
 * node farthest from an arbitrary start.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def treeDiameter(self, edges):
 *  3          if not edges: return 0
 *  4          graph = defaultdict(list)
 *  5          for u, v in edges:
 *  6              graph[u].append(v); graph[v].append(u)
 *  7          def bfs(start):
 *  8              visited = {start}
 *  9              queue = deque([(start, 0)])
 * 10              far_node, far_dist = start, 0
 * 11              while queue:
 * 12                  node, dist = queue.popleft()
 * 13                  if dist > far_dist: far_node, far_dist = node, dist
 * 14                  for nei in graph[node]:
 * 15                      if nei not in visited:
 * 16                          visited.add(nei)
 * 17                          queue.append((nei, dist+1))
 * 18              return far_node, far_dist
 * 19          a, _ = bfs(0)
 * 20          _, diameter = bfs(a)
 * 21          return diameter
 */
function buildSteps1245(input) {
  const edgeList = String(input || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(",").map(Number))
    .filter((e) => e.length === 2 && !e.some(Number.isNaN));
  const steps = [];

  if (edgeList.length === 0) {
    steps.push({
      title: { vi: "edges rỗng → return 0", en: "edges is empty → return 0" },
      arr: [], graph: { nodes: [{ id: 0, label: "0" }], edges: [], hlNodes: [], hlEdges: [], visitedNodes: [] },
      highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Không có cạnh → cây chỉ có 1 node → đường kính 0.", en: "No edges → the tree has a single node → diameter 0." },
    });
    return { original: edgeList, answer: 0, steps };
  }

  const nodeSet = new Set();
  for (const [u, v] of edgeList) { nodeSet.add(u); nodeSet.add(v); }
  const nodes = [...nodeSet].sort((a, b) => a - b);
  const adj = {};
  for (const v of nodes) adj[v] = [];
  for (const [u, v] of edgeList) { adj[u].push(v); adj[v].push(u); }

  function currentNodes() {
    return nodes.map((id) => ({ id, label: String(id) }));
  }
  function currentEdges() {
    return edgeList.map(([u, v]) => ({ u, v, w: "" }));
  }

  function snap({ hlNodes = [], hlEdges = [], visitedNodes = [], title, note, vars, codeLines, final = false }) {
    steps.push({
      title, arr: [],
      graph: { nodes: currentNodes(), edges: currentEdges(), hlNodes, hlEdges, visitedNodes },
      highlight: [], mark: [], final, codeLines, vars: vars || [], note,
    });
  }

  snap({
    title: { vi: "Ý tưởng: BFS 2 lần (double-BFS)", en: "Idea: double BFS" },
    codeLines: [3, 4, 5, 6],
    vars: [{ name: "n edges", value: edgeList.length }, { name: "n nodes", value: nodes.length }],
    note: {
      vi:
        "Đường kính cây = đường đi dài nhất giữa 2 node. Tính chất: BFS từ MỘT node bất kỳ, node xa nhất tìm được (A) luôn là MỘT ĐẦU của đường kính. " +
        "BFS lần 2 từ A cho ra đầu còn lại (B) và khoảng cách chính là đường kính.",
      en:
        "Tree diameter = the longest path between two nodes. Key property: BFS from ANY node, the farthest node found (A) is always ONE ENDPOINT of the diameter. " +
        "A second BFS from A finds the other endpoint (B) and that distance is the diameter.",
    },
  });

  function bfsTrace(start, phaseLabel, codeLinesForPhase) {
    const visited = new Set([start]);
    const queue = [[start, 0]];
    let farNode = start;
    let farDist = 0;

    snap({
      title: { vi: `${phaseLabel}: bfs(${start}) — khởi tạo`, en: `${phaseLabel}: bfs(${start}) — initialize` },
      hlNodes: [start], visitedNodes: [start],
      codeLines: [7, 8, 9, 10],
      vars: [{ name: "start", value: start }, { name: "visited", value: `{${start}}` }, { name: "queue", value: `[(${start},0)]` }, { name: "far_node", value: farNode }, { name: "far_dist", value: farDist }],
      note: {
        vi: `Bắt đầu BFS từ node ${start}. visited={${start}}, queue=[(${start},0)].`,
        en: `Start BFS from node ${start}. visited={${start}}, queue=[(${start},0)].`,
      },
    });

    let guard = 0;
    while (queue.length && guard++ < 500) {
      const [node, dist] = queue.shift();
      snap({
        title: { vi: `${phaseLabel}: popleft → (${node}, dist=${dist})`, en: `${phaseLabel}: popleft → (${node}, dist=${dist})` },
        hlNodes: [node], visitedNodes: [...visited],
        codeLines: [12],
        vars: [{ name: "node", value: node }, { name: "dist", value: dist }],
        note: { vi: `Lấy (${node}, ${dist}) ra khỏi queue.`, en: `Dequeue (${node}, ${dist}).` },
      });

      const improved = dist > farDist;
      if (improved) { farNode = node; farDist = dist; }
      snap({
        title: { vi: `${phaseLabel}: dist=${dist} > far_dist=${improved ? farDist - dist + dist : farDist}? → ${improved}`, en: `${phaseLabel}: dist=${dist} > far_dist? → ${improved}` },
        hlNodes: [node], visitedNodes: [...visited],
        codeLines: [13],
        vars: [{ name: "far_node", value: farNode }, { name: "far_dist", value: farDist }],
        note: improved
          ? { vi: `Node ${node} ở xa hơn (dist=${dist}) → cập nhật far_node=${node}, far_dist=${dist}.`, en: `Node ${node} is farther (dist=${dist}) → update far_node=${node}, far_dist=${dist}.` }
          : { vi: `dist=${dist} không lớn hơn far_dist=${farDist} → không cập nhật.`, en: `dist=${dist} does not exceed far_dist=${farDist} → no update.` },
      });

      for (const nei of adj[node]) {
        const isNew = !visited.has(nei);
        snap({
          title: { vi: `${phaseLabel}: neighbor ${nei} chưa thăm? → ${isNew}`, en: `${phaseLabel}: neighbor ${nei} unvisited? → ${isNew}` },
          hlNodes: [node, nei], hlEdges: [[node, nei]], visitedNodes: [...visited],
          codeLines: [14, 15],
          vars: [{ name: "neighbor", value: nei }, { name: "in visited?", value: !isNew }],
          note: isNew
            ? { vi: `${nei} chưa thăm → thêm vào visited và queue.`, en: `${nei} is unvisited → add it to visited and the queue.` }
            : { vi: `${nei} đã thăm → bỏ qua.`, en: `${nei} was already visited → skip it.` },
        });
        if (isNew) {
          visited.add(nei);
          queue.push([nei, dist + 1]);
          snap({
            title: { vi: `${phaseLabel}: visited.add(${nei}); queue.append((${nei}, ${dist + 1}))`, en: `${phaseLabel}: visited.add(${nei}); queue.append((${nei}, ${dist + 1}))` },
            hlNodes: [nei], hlEdges: [[node, nei]], visitedNodes: [...visited],
            codeLines: [16, 17],
            vars: [{ name: "visited size", value: visited.size }, { name: "queue", value: `[${queue.map(([n, d]) => `(${n},${d})`).join(", ")}]` }],
            note: { vi: `${nei} đã được đưa vào visited và queue với dist=${dist + 1}.`, en: `${nei} added to visited and the queue with dist=${dist + 1}.` },
          });
        }
      }
    }

    snap({
      title: { vi: `${phaseLabel}: return (far_node=${farNode}, far_dist=${farDist})`, en: `${phaseLabel}: return (far_node=${farNode}, far_dist=${farDist})` },
      hlNodes: [farNode], visitedNodes: [...visited],
      codeLines: [18],
      vars: [{ name: "far_node", value: farNode }, { name: "far_dist", value: farDist }],
      note: { vi: `BFS từ ${start} kết thúc. Node xa nhất = ${farNode}, khoảng cách = ${farDist}.`, en: `BFS from ${start} is done. Farthest node = ${farNode}, distance = ${farDist}.` },
    });

    return { farNode, farDist };
  }

  const startNode = nodes[0];
  const { farNode: a } = bfsTrace(startNode, "BFS #1", [19]);
  snap({
    title: { vi: `a = ${a} (một đầu của đường kính)`, en: `a = ${a} (one diameter endpoint)` },
    hlNodes: [a],
    codeLines: [19],
    vars: [{ name: "a", value: a }],
    note: {
      vi: `Node xa nhất từ ${startNode} là ${a}. Theo tính chất cây, ${a} chắc chắn là một đầu mút của đường kính.`,
      en: `The farthest node from ${startNode} is ${a}. By the tree property, ${a} is guaranteed to be one endpoint of the diameter.`,
    },
  });

  const { farNode: b, farDist: diameter } = bfsTrace(a, "BFS #2", [20]);

  snap({
    title: { vi: `Kết quả: diameter = ${diameter}`, en: `Result: diameter = ${diameter}` },
    hlNodes: [a, b], hlEdges: [], visitedNodes: nodes,
    final: true, codeLines: [21],
    vars: [{ name: "endpoint A", value: a }, { name: "endpoint B", value: b }, { name: "answer", value: diameter }],
    note: {
      vi: `BFS lần 2 từ ${a} tìm được node xa nhất ${b} với khoảng cách ${diameter}. Đây chính là đường kính của cây.`,
      en: `The second BFS from ${a} finds the farthest node ${b} at distance ${diameter}. That distance is the tree's diameter.`,
    },
  });

  return { original: edgeList, answer: diameter, steps };
}

/**
 * LeetCode 3310: Remove Methods From Project.
 *
 * n methods numbered 0..n-1, directed invocation graph, and a known buggy
 * method k. A method is "suspicious" if it's reachable from k in the call
 * graph. The suspicious group can only be REMOVED if NO method outside the
 * group invokes any method INSIDE the group. If removal is possible, return
 * all non-suspicious methods sorted; otherwise return all methods 0..n-1.
 *
 * Algorithm:
 *   1. BFS/DFS from k → suspicious set S.
 *   2. Check: any edge (u, v) where u ∉ S and v ∈ S? If yes → can't remove.
 *   3. Return sorted remaining methods (or all if can't remove).
 */
function buildSteps3310(input, params) {
  const n = Number(params.n);
  const k = Number(params.k);
  const edgesRaw = String(input).split(",").map((s) => s.trim()).filter(Boolean);
  const edges = edgesRaw.map((e) => { const [a, b] = e.split("-").map(Number); return [a, b]; }).filter(([a, b]) => !isNaN(a) && !isNaN(b));
  const steps = [];

  const allNodes = Array.from({ length: n }, (_, id) => id);
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); }
  const graphEdges = edges.map(([u, v]) => ({ u, v, w: "" }));

  function makeGraph(hlNodes, hlEdges, visitedNodes) {
    return {
      nodes: allNodes.map((id) => ({ id, label: String(id) })),
      edges: graphEdges,
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: visitedNodes || [],
    };
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      graph: makeGraph(opts.hlNodes, opts.hlEdges, opts.visitedNodes),
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Line 3: adj = [[] for _ in range(n)]
  snap({
    title: { vi: "adj = [[] for _ in range(n)]", en: "adj = [[] for _ in range(n)]" },
    codeLines: [3],
    vars: [{ name: "n", value: n }, { name: "k", value: k }],
    note: {
      vi: `n=${n} methods, k=${k} bị lỗi. Xây adjacency list có hướng từ danh sách invocations.`,
      en: `n=${n} methods, k=${k} is buggy. Build a directed adjacency list from the invocations.`,
    },
  });

  // Line 4-5: for a, b in invocations: adj[a].append(b)
  for (const [a, b] of edges) {
    snap({
      title: { vi: `for a,b in invocations → (${a},${b}): adj[${a}].append(${b})`, en: `for a,b in invocations → (${a},${b}): adj[${a}].append(${b})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [4, 5],
      vars: [{ name: `adj[${a}]`, value: `[${adj[a].join(",")}]` }],
      note: {
        vi: `Method ${a} gọi method ${b} → thêm ${b} vào adj[${a}].`,
        en: `Method ${a} calls method ${b} → add ${b} to adj[${a}].`,
      },
    });
  }

  // Line 6: suspicious = set()
  const suspicious = new Set();
  snap({
    title: { vi: "suspicious = set()", en: "suspicious = set()" },
    codeLines: [6],
    note: {
      vi: "Tập suspicious sẽ chứa tất cả method mà k gọi được (trực/gián tiếp).",
      en: "The suspicious set will hold every method reachable from k (directly or transitively).",
    },
  });

  // Line 7: queue = deque([k])
  const queue = [k];
  snap({
    title: { vi: `queue = deque([${k}])`, en: `queue = deque([${k}])` },
    hlNodes: [k],
    codeLines: [7],
    vars: [{ name: "queue", value: `[${k}]` }],
    note: {
      vi: `Đưa k=${k} vào queue để bắt đầu BFS.`,
      en: `Push k=${k} into the queue to start BFS.`,
    },
  });

  // Line 8: suspicious.add(k)
  suspicious.add(k);
  snap({
    title: { vi: `suspicious.add(${k})`, en: `suspicious.add(${k})` },
    hlNodes: [k],
    visitedNodes: [...suspicious],
    codeLines: [8],
    vars: [{ name: "suspicious", value: `{${[...suspicious].join(",")}}` }],
    note: {
      vi: `k=${k} chắc chắn suspicious (nó là method bị lỗi).`,
      en: `k=${k} is definitely suspicious (it's the buggy method itself).`,
    },
  });

  // BFS loop
  while (queue.length) {
    // Line 9: while queue:
    snap({
      title: { vi: `while queue → True (queue=[${queue.join(",")}])`, en: `while queue → True (queue=[${queue.join(",")}])` },
      visitedNodes: [...suspicious],
      codeLines: [9],
      vars: [{ name: "queue", value: `[${queue.join(",")}]` }],
      note: {
        vi: `queue không rỗng → còn method cần kiểm tra hàng xóm.`,
        en: `queue is not empty → there are still methods whose neighbors need checking.`,
      },
    });

    // Line 10: node = queue.popleft()
    const node = queue.shift();
    snap({
      title: { vi: `node = queue.popleft() → ${node}`, en: `node = queue.popleft() → ${node}` },
      hlNodes: [node],
      visitedNodes: [...suspicious],
      codeLines: [10],
      vars: [{ name: "node", value: node }, { name: "adj[node]", value: `[${adj[node].join(",")}]` }],
      note: {
        vi: `Lấy method ${node} ra khỏi queue. Sẽ xét tất cả method mà ${node} gọi (adj[${node}]=[${adj[node].join(",")}]).`,
        en: `Pop method ${node} from the queue. Will check all methods that ${node} calls (adj[${node}]=[${adj[node].join(",")}]).`,
      },
    });

    for (const nxt of adj[node]) {
      // Line 11: for nxt in adj[node]:
      const alreadySuspicious = suspicious.has(nxt);
      snap({
        title: { vi: `for nxt in adj[${node}]: nxt=${nxt}; nxt in suspicious? → ${alreadySuspicious}`, en: `for nxt in adj[${node}]: nxt=${nxt}; nxt in suspicious? → ${alreadySuspicious}` },
        hlNodes: [node, nxt],
        hlEdges: [[node, nxt]],
        visitedNodes: [...suspicious],
        codeLines: [11, 12],
        vars: [{ name: "nxt", value: nxt }],
        note: alreadySuspicious
          ? { vi: `${nxt} đã có trong suspicious → bỏ qua (đã xét trước đó).`, en: `${nxt} is already in suspicious → skip (already processed).` }
          : { vi: `${nxt} chưa có trong suspicious → thêm vào.`, en: `${nxt} is not in suspicious yet → add it.` },
      });

      if (!alreadySuspicious) {
        // Line 13-14: suspicious.add(nxt); queue.append(nxt)
        suspicious.add(nxt);
        queue.push(nxt);
        snap({
          title: { vi: `suspicious.add(${nxt}); queue.append(${nxt})`, en: `suspicious.add(${nxt}); queue.append(${nxt})` },
          hlNodes: [nxt],
          visitedNodes: [...suspicious],
          codeLines: [13, 14],
          vars: [{ name: "suspicious", value: `{${[...suspicious].sort((a, b) => a - b).join(",")}}` }, { name: "queue", value: `[${queue.join(",")}]` }],
          note: {
            vi: `Thêm ${nxt} vào suspicious và queue (sẽ xét hàng xóm của ${nxt} sau).`,
            en: `Add ${nxt} to suspicious and queue (will check ${nxt}'s neighbors later).`,
          },
        });
      }
    }
  }

  // Line 9 final: while queue → False
  snap({
    title: { vi: "while queue → False (queue rỗng)", en: "while queue → False (queue empty)" },
    visitedNodes: [...suspicious],
    codeLines: [9],
    vars: [{ name: "suspicious", value: `{${[...suspicious].sort((a, b) => a - b).join(",")}}` }],
    note: {
      vi: `BFS hoàn tất. Tập suspicious = {${[...suspicious].sort((a, b) => a - b).join(",")}} (${suspicious.size} methods).`,
      en: `BFS complete. Suspicious set = {${[...suspicious].sort((a, b) => a - b).join(",")}} (${suspicious.size} methods).`,
    },
  });

  // Line 15-16: for a, b in invocations: if a not in suspicious and b in suspicious: return list(range(n))
  let canRemove = true;
  let blockingEdge = null;
  for (const [u, v] of edges) {
    const uOut = !suspicious.has(u);
    const vIn = suspicious.has(v);
    const blocks = uOut && vIn;

    snap({
      title: { vi: `Kiểm cạnh (${u},${v}): ${u}∉S? ${uOut}, ${v}∈S? ${vIn} → ${blocks ? "CHẶN" : "OK"}`, en: `Check edge (${u},${v}): ${u}∉S? ${uOut}, ${v}∈S? ${vIn} → ${blocks ? "BLOCKS" : "OK"}` },
      hlNodes: [u, v],
      hlEdges: [[u, v]],
      visitedNodes: [...suspicious],
      codeLines: [15, 16],
      vars: [{ name: "a,b", value: `(${u},${v})` }, { name: "a∉suspicious", value: uOut }, { name: "b∈suspicious", value: vIn }],
      note: blocks
        ? { vi: `Method ${u} ở NGOÀI suspicious nhưng GỌI ${v} BÊN TRONG → nếu xóa nhóm suspicious thì ${u} sẽ bị hỏng → KHÔNG THỂ xóa.`, en: `Method ${u} is OUTSIDE suspicious but CALLS ${v} INSIDE → removing the suspicious group would break ${u} → CANNOT remove.` }
        : { vi: `Cạnh (${u},${v}) không chặn (${uOut ? "u ngoài nhưng v cũng ngoài" : "u trong suspicious nên vô hại"}).`, en: `Edge (${u},${v}) doesn't block (${uOut ? "u outside but v also outside" : "u is inside suspicious so harmless"}).` },
    });

    if (blocks) {
      canRemove = false;
      blockingEdge = [u, v];

      // Line 17: return list(range(n))
      snap({
        title: { vi: `return list(range(n)) → [${allNodes.join(",")}]`, en: `return list(range(n)) → [${allNodes.join(",")}]` },
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        visitedNodes: [...suspicious],
        final: true,
        codeLines: [17],
        vars: [{ name: "answer", value: `[${allNodes.join(",")}]` }],
        note: {
          vi: `Có method bên ngoài (${u}) gọi vào suspicious (${v}) → không thể xóa nhóm → trả tất cả ${n} methods.`,
          en: `An outside method (${u}) calls into suspicious (${v}) → can't remove the group → return all ${n} methods.`,
        },
      });
      break;
    }
  }

  if (canRemove) {
    // Line 18: return [i for i in range(n) if i not in suspicious]
    const answer = allNodes.filter((id) => !suspicious.has(id));
    snap({
      title: { vi: `return [i for i in range(n) if i not in suspicious] → [${answer.join(",")}]`, en: `return [i for i in range(n) if i not in suspicious] → [${answer.join(",")}]` },
      hlNodes: answer,
      visitedNodes: [...suspicious],
      final: true,
      codeLines: [18],
      vars: [{ name: "answer", value: `[${answer.join(",")}]` }],
      note: {
        vi: `Không có cạnh nào từ ngoài gọi vào suspicious → xóa nhóm an toàn. Còn lại: [${answer.join(",")}].`,
        en: `No edge from outside calls into suspicious → safe to remove the group. Remaining: [${answer.join(",")}].`,
      },
    });
    return { original: edges, n, k, answer, steps };
  }

  return { original: edges, n, k, answer: allNodes, steps };
}

module.exports = {
  // Category metadata: recommended display order for the Graph tag.
  // Picked up by problems/index.js and exposed to the catalog UI.
  __meta: {
    order: [200, 994, 542, 1162, 1765, 286, 934, 417, 130, 1020, 1091, 505, 1926, 207, 210, 269, 399, 126, 127, 332, 743, 1514, 1631, 778, 1976, 787, 3977, 3620, 752, 815, 827, 847, 851, 864, 1136, 1192, 1197, 1236, 1293, 3286, 1368, 2290, 2577, 3341, 3342, 1377, 2492, 317, 329, 407, 489, 4003, 3310],
    extraCategories: {
      "multi-source-bfs": {
        order: [994, 542, 1162, 1765, 286, 934, 417, 130, 1020],
        label: { vi: "Lộ trình Multi-source BFS", en: "Multi-source BFS learning path" },
      },
      "flood-fill": {
        order: [733, 200, 695, 1020, 130, 1905],
        label: { vi: "Lộ trình Flood Fill", en: "Flood Fill learning path" },
      },
    },
    label: {
      vi: "Thứ tự học được khuyến nghị",
      en: "Recommended learning order",
    },
  },
  329: {
    id: 329,
    difficulty: "hard",
    slug: "longest-increasing-path-in-a-matrix",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Longest Increasing Path in a Matrix", en: "Longest Increasing Path in a Matrix" },
    titleVi: { vi: "Đường tăng dài nhất trong ma trận (DFS + memo)", en: "Longest increasing path (DFS + memo)" },
    statement: {
      vi:
        "Cho ma trận số nguyên. Tìm độ dài đường đi TĂNG DẦN dài nhất (đi 4 hướng, mỗi bước tới ô LỚN HƠN). " +
        "Nhập ma trận: hàng cách bởi ';', giá trị cách bởi ','. VD: 9,9,4;6,6,8;2,1,1",
      en:
        "Given an integer matrix, find the length of the longest strictly INCREASING path (move 4-directionally to a LARGER cell). " +
        "Enter matrix: rows separated by ';', values by ','. e.g. 9,9,4;6,6,8;2,1,1",
    },
    defaultInput: "9,9,4;6,6,8;2,1,1",
    inputKind: "string",
    inputLabel: { vi: "Ma trận (hàng cách ;)", en: "Matrix (rows separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "dfs(r,c) = độ dài đường tăng dài nhất bắt đầu tại (r,c).", en: "dfs(r,c) = length of the longest increasing path starting at (r,c)." },
      { vi: "Từ mỗi ô, thử 4 hướng; chỉ đi tới ô có giá trị LỚN HƠN.", en: "From each cell, try 4 directions; move only to a strictly LARGER cell." },
      { vi: "Ghi nhớ memo[r][c] để mỗi ô chỉ tính 1 lần → tránh lặp.", en: "Memoize memo[r][c] so each cell is computed once → avoids recomputation." },
      { vi: "Đáp án = max của dfs trên mọi ô. Nhãn ô là 'giá trị·memo'.", en: "Answer = max of dfs over all cells. Cell label is 'value·memo'." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Mỗi ô được tính đúng 1 lần nhờ memo → O(m·n).",
        en: "Each cell is computed exactly once thanks to memo → O(m·n).",
      },
    },
    code: [
      "class Solution:",
      "    def longestIncreasingPath(self, matrix):",
      "        rows, cols = len(matrix), len(matrix[0])",
      "        memo = [[0]*cols for _ in range(rows)]",
      "        def dfs(r, c):",
      "            if memo[r][c]: return memo[r][c]",
      "            best = 1",
      "            for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:",
      "                nr, nc = r+dr, c+dc",
      "                if 0<=nr<rows and 0<=nc<cols and matrix[nr][nc] > matrix[r][c]:",
      "                    best = max(best, 1 + dfs(nr, nc))",
      "            memo[r][c] = best",
      "            return best",
      "        return max(dfs(r,c) for r in range(rows) for c in range(cols))",
    ],
    builder: buildSteps329,
  },
  269: {
    id: 269,
    difficulty: "hard",
    slug: "alien-dictionary",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Alien Dictionary", en: "Alien Dictionary" },
    titleVi: { vi: "Từ điển người ngoài hành tinh (Topological Sort)", en: "Alien Dictionary (Topological Sort)" },
    statement: {
      vi:
        "Cho danh sách từ đã sắp xếp theo thứ tự bảng chữ cái của một ngôn ngữ lạ. " +
        "Suy ra thứ tự các ký tự. Nếu không hợp lệ, trả về \"\". " +
        "Nhập các từ cách nhau bởi dấu phẩy hoặc khoảng trắng.",
      en:
        "Given a list of words sorted in an alien language's alphabet order, derive the character order. " +
        "If invalid, return \"\". Enter words separated by commas or spaces.",
    },
    defaultInput: "wrt,wrf,er,ett,rftt",
    inputKind: "string",
    inputLabel: { vi: "Từ (cách bởi , hoặc khoảng trắng)", en: "Words (comma/space separated)" },
    extraParams: [],
    approach: [
      { vi: "So sánh từng cặp từ liền nhau; ký tự KHÁC NHAU đầu tiên cho cạnh a → b (a đứng trước b).", en: "Compare adjacent word pairs; the FIRST differing char gives edge a → b (a before b)." },
      { vi: "Nếu w1 dài hơn w2 nhưng là tiền tố của w2 → không hợp lệ → \"\".", en: "If w1 is longer than w2 but a prefix of it → invalid → \"\"." },
      { vi: "Topological sort (Kahn): đưa mọi ký tự indegree=0 vào queue, pop dần và giảm indegree hàng xóm.", en: "Topological sort (Kahn): enqueue all indegree-0 chars, pop and decrement neighbors' indegree." },
      { vi: "Nếu result thiếu ký tự → có chu trình → \"\".", en: "If result misses characters → a cycle exists → \"\"." },
    ],
    complexity: {
      time: "O(C)",
      space: "O(1) + O(unique chars)",
      note: {
        vi: "C = tổng số ký tự trong tất cả các từ. Đồ thị tối đa 26 node.",
        en: "C = total characters across all words. Graph has at most 26 nodes.",
      },
    },
    code: [
      "from collections import defaultdict, deque",
      "class Solution:",
      "    def alienOrder(self, words):",
      "        graph = defaultdict(set)",
      "        indegree = {c: 0 for w in words for c in w}",
      "        for w1, w2 in zip(words, words[1:]):",
      "            for a, b in zip(w1, w2):",
      "                if a != b:",
      "                    if b not in graph[a]:",
      "                        graph[a].add(b); indegree[b] += 1",
      "                    break",
      "            else:",
      "                if len(w1) > len(w2): return ''",
      "        queue = deque([c for c in indegree if indegree[c]==0])",
      "        result = []",
      "        while queue:",
      "            c = queue.popleft(); result.append(c)",
      "            for nxt in graph[c]:",
      "                indegree[nxt] -= 1",
      "                if indegree[nxt]==0: queue.append(nxt)",
      "        if len(result) < len(indegree): return ''",
      "        return ''.join(result)",
    ],
    builder: buildSteps269,
  },
  1192: {
    id: 1192,
    difficulty: "hard",
    slug: "critical-connections-in-a-network",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Critical Connections in a Network", en: "Critical Connections in a Network" },
    titleVi: { vi: "Tìm cầu trong đồ thị (Tarjan)", en: "Find bridges in a graph (Tarjan)" },
    statement: {
      vi:
        "Cho n server (0..n-1) và các kết nối vô hướng. Tìm mọi 'critical connection' (cầu) — " +
        "cạnh mà nếu xóa đi sẽ làm mạng mất liên thông. Nhập cạnh dạng u-v cách nhau dấu phẩy.",
      en:
        "Given n servers (0..n-1) and undirected connections, find all 'critical connections' (bridges) — " +
        "edges whose removal disconnects the network. Enter edges as u-v separated by commas.",
    },
    defaultInput: "0-1,1-2,2-0,1-3",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (u-v, cách bởi ,)", en: "Edges (u-v, comma separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số server)", en: "n (servers)" }, default: 4 },
    ],
    approach: [
      { vi: "DFS gán disc[u] (thời điểm thăm) và low[u] (disc nhỏ nhất quay ngược tới được).", en: "DFS assigns disc[u] (discovery time) and low[u] (smallest disc reachable back)." },
      { vi: "Cạnh cây (u→v chưa thăm): sau đệ quy, low[u] = min(low[u], low[v]).", en: "Tree edge (u→v unvisited): after recursion, low[u] = min(low[u], low[v])." },
      { vi: "Cạnh ngược (v đã thăm, ≠ parent): low[u] = min(low[u], disc[v]).", en: "Back edge (v visited, ≠ parent): low[u] = min(low[u], disc[v])." },
      { vi: "Nếu low[v] > disc[u] thì cạnh (u,v) là CẦU — v không có đường vòng nào khác về u.", en: "If low[v] > disc[u] then edge (u,v) is a BRIDGE — v has no alternate route back to u." },
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V + E)",
      note: {
        vi: "Một lần DFS duyệt mỗi đỉnh và cạnh đúng 1 lần.",
        en: "A single DFS visits each vertex and edge once.",
      },
    },
    code: [
      "class Solution:",
      "    def criticalConnections(self, n, connections):",
      "        graph = defaultdict(list)",
      "        for u, v in connections: graph[u].append(v); graph[v].append(u)",
      "        disc = [-1]*n; low = [0]*n; bridges = []; timer = [0]",
      "        def dfs(node, parent):",
      "            disc[node] = low[node] = timer[0]; timer[0] += 1",
      "            for nxt in graph[node]:",
      "                if nxt == parent: continue",
      "                if disc[nxt] == -1:",
      "                    dfs(nxt, node)",
      "                    low[node] = min(low[node], low[nxt])",
      "                    if low[nxt] > disc[node]: bridges.append([node, nxt])",
      "                else:",
      "                    low[node] = min(low[node], disc[nxt])",
      "        for i in range(n):",
      "            if disc[i] == -1: dfs(i, -1)",
      "        return bridges",
    ],
    builder: buildSteps1192,
  },
  317: {
    id: 317,
    difficulty: "hard",
    slug: "shortest-distance-from-all-buildings",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Shortest Distance from All Buildings", en: "Shortest Distance from All Buildings" },
    titleVi: { vi: "Khoảng cách ngắn nhất tới mọi tòa nhà (multi-BFS)", en: "Shortest total distance to all buildings (multi-BFS)" },
    statement: {
      vi:
        "Cho lưới: 0 = đất trống, 1 = tòa nhà, 2 = chướng ngại. Tìm ô đất trống sao cho tổng khoảng cách " +
        "(đường đi 4 hướng) tới TẤT CẢ tòa nhà là NHỎ NHẤT. Trả về tổng đó, hoặc -1 nếu không có. " +
        "Nhập lưới: hàng cách bởi ';', giá trị cách bởi ','.",
      en:
        "Given a grid: 0 = empty land, 1 = building, 2 = obstacle. Find an empty cell minimizing the total " +
        "travel distance (4-directional) to ALL buildings. Return that total, or -1 if impossible. " +
        "Enter grid: rows separated by ';', values by ','.",
    },
    defaultInput: "1,0,2,0,1;0,0,0,0,0;0,0,1,0,0",
    inputKind: "string",
    inputLabel: { vi: "Lưới (0/1/2, hàng cách ;)", en: "Grid (0/1/2, rows separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "Chạy BFS từ MỖI tòa nhà (giá trị 1) qua các ô trống (giá trị 0).", en: "Run BFS from EACH building (value 1) across empty cells (value 0)." },
      { vi: "total[ô] += khoảng cách từ tòa nhà; reach[ô] += 1 (đếm số tòa nhà tới được ô).", en: "total[cell] += distance from that building; reach[cell] += 1 (count buildings reaching it)." },
      { vi: "Ô hợp lệ phải được TẤT CẢ tòa nhà tới được (reach == số tòa nhà).", en: "A valid cell must be reachable by ALL buildings (reach == building count)." },
      { vi: "Đáp án = min total trong các ô hợp lệ, hoặc -1.", en: "Answer = min total among valid cells, or -1." },
    ],
    complexity: {
      time: "O(k·rows·cols)",
      space: "O(rows·cols)",
      note: {
        vi: "k = số tòa nhà. Mỗi BFS là O(rows·cols).",
        en: "k = number of buildings. Each BFS is O(rows·cols).",
      },
    },
    code: [
      "class Solution:",
      "    def shortestDistance(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        total = [[0]*cols for _ in range(rows)]",
      "        reach = [[0]*cols for _ in range(rows)]",
      "        buildings = 0",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if grid[r][c] == 1:",
      "                    buildings += 1",
      "                    bfs(r, c)   # accumulate distances & reach",
      "        best = float('inf')",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if grid[r][c] == 0 and reach[r][c] == buildings:",
      "                    best = min(best, total[r][c])",
      "        return best if best != float('inf') else -1",
    ],
    builder: buildSteps317,
  },
  489: {
    id: 489,
    difficulty: "hard",
    slug: "robot-room-cleaner",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Robot Room Cleaner", en: "Robot Room Cleaner" },
    titleVi: { vi: "Robot lau phòng (backtracking DFS)", en: "Robot room cleaner (backtracking DFS)" },
    statement: {
      vi:
        "Robot chỉ biết move()/turnLeft()/turnRight()/clean() và KHÔNG biết bản đồ hay tọa độ. " +
        "Lau sạch mọi ô tới được. Ta tự theo dõi (r,c,hướng) và backtrack. " +
        "Nhập lưới 0/1 (1 = đi được, 0 = tường): hàng cách ';', giá trị cách ','.",
      en:
        "The robot only knows move()/turnLeft()/turnRight()/clean() and does NOT know the map or coordinates. " +
        "Clean every reachable cell. We track (r,c,facing) ourselves and backtrack. " +
        "Enter a 0/1 grid (1 = accessible, 0 = wall): rows separated by ';', values by ','.",
    },
    defaultInput: "1,1,1,1,1,0,1,1;1,1,1,1,1,0,1,1;1,0,1,1,1,1,1,1;0,0,0,1,0,0,0,0;1,1,1,1,1,1,1,1",
    inputKind: "string",
    inputLabel: { vi: "Lưới 0/1 (hàng cách ;)", en: "0/1 grid (rows separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "Backtracking DFS: lau ô hiện tại, đánh dấu visited, thử 4 hướng theo thứ tự xoay phải.", en: "Backtracking DFS: clean current cell, mark visited, try 4 directions in right-turn order." },
      { vi: "Nếu ô kế chưa thăm và move() thành công → đệ quy vào ô đó.", en: "If the next cell is unvisited and move() succeeds → recurse into it." },
      { vi: "Sau khi xong nhánh, 'go_back': xoay 180°, move về, xoay 180° lại để giữ hướng.", en: "After a branch, 'go_back': turn 180°, move back, turn 180° again to keep facing." },
      { vi: "Mỗi vòng lặp turnRight() để thử hướng kế tiếp. Ta theo dõi tọa độ tuyệt đối để biết visited.", en: "Each loop turnRight() to try the next direction. We track absolute coordinates to know visited." },
    ],
    complexity: {
      time: "O(N)",
      space: "O(N)",
      note: {
        vi: "N = số ô tới được. Mỗi ô thăm 1 lần; mỗi cạnh xét hằng số lần.",
        en: "N = reachable cells. Each cell visited once; each edge examined a constant number of times.",
      },
    },
    code: [
      "class Solution:",
      "    def cleanRoom(self, robot):",
      "        visited = set()",
      "        def go_back():",
      "            robot.turnRight(); robot.turnRight()",
      "            robot.move()",
      "            robot.turnRight(); robot.turnRight()",
      "        def dfs(r, c, d):",
      "            visited.add((r, c)); robot.clean()",
      "            for i in range(4):",
      "                nd = (d + i) % 4",
      "                nr, nc = r + dir[nd][0], c + dir[nd][1]",
      "                if (nr, nc) not in visited and robot.move():",
      "                    dfs(nr, nc, nd)",
      "                    go_back()",
      "                robot.turnRight()",
      "        dfs(0, 0, 0)",
    ],
    builder: buildSteps489,
  },
  864: {
    id: 864,
    difficulty: "hard",
    slug: "shortest-path-to-get-all-keys",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Shortest Path to Get All Keys", en: "Shortest Path to Get All Keys" },
    titleVi: { vi: "Đường ngắn nhất thu hết chìa khóa (BFS + bitmask)", en: "Shortest path to collect all keys (BFS + bitmask)" },
    statement: {
      vi:
        "Cho lưới: '@' xuất phát, '.' ô trống, '#' tường, chữ thường a-f là chìa khóa, chữ HOA A-F là cửa khóa " +
        "(chỉ mở khi có chìa cùng chữ). Tìm số bước ít nhất để thu HẾT chìa khóa. Nhập lưới: hàng cách bởi ';'.",
      en:
        "Given a grid: '@' start, '.' empty, '#' wall, lowercase a-f are keys, UPPERCASE A-F are locks " +
        "(open only with the matching key). Find the fewest steps to collect ALL keys. Enter grid: rows separated by ';'.",
    },
    defaultInput: "@.a..;###.#;b.A.B",
    inputKind: "string",
    inputLabel: { vi: "Lưới (hàng cách ;)", en: "Grid (rows separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "Trạng thái BFS = (hàng, cột, tập chìa khóa dạng bitmask). Mỗi chìa a-f là 1 bit.", en: "BFS state = (row, col, keys bitmask). Each key a-f is one bit." },
      { vi: "Không đi vào tường '#'; cửa 'A'-'F' chỉ qua được nếu bitmask đã có chìa tương ứng.", en: "Cannot enter walls '#'; a door 'A'-'F' is passable only if the bitmask has its matching key." },
      { vi: "Khi vào ô chìa khóa, bật bit tương ứng trong bitmask.", en: "When entering a key cell, set the corresponding bit in the bitmask." },
      { vi: "visited theo (ô, keys). Đích đạt được khi keys == all_keys → trả về số bước.", en: "visited tracks (cell, keys). Goal reached when keys == all_keys → return steps." },
    ],
    complexity: {
      time: "O(rows·cols·2^k)",
      space: "O(rows·cols·2^k)",
      note: {
        vi: "k = số chìa khóa (≤ 6). Mỗi ô nhân với 2^k trạng thái bitmask.",
        en: "k = number of keys (≤ 6). Each cell times 2^k bitmask states.",
      },
    },
    code: [
      "from collections import deque",
      "class Solution:",
      "    def shortestPathAllKeys(self, grid):",
      "        # find start, count all_keys bitmask",
      "        queue = deque([(sr, sc, 0, 0)])  # r, c, keys, steps",
      "        visited = {(sr, sc, 0)}",
      "        while queue:",
      "            r, c, keys, steps = queue.popleft()",
      "            if keys == all_keys: return steps",
      "            for dr, dc in dirs:",
      "                nr, nc = r + dr, c + dc",
      "                if out_of_bounds or grid[nr][nc] == '#': continue",
      "                if is_lock and not (keys >> (ord-'A') & 1): continue",
      "                new_keys = keys | key_bit if is_key else keys",
      "                if (nr, nc, new_keys) not in visited: enqueue",
      "        return -1",
    ],
    builder: buildSteps864,
  },
  407: {
    id: 407,
    difficulty: "hard",
    slug: "trapping-rain-water-ii",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Trapping Rain Water II", en: "Trapping Rain Water II" },
    titleVi: { vi: "Hứng nước mưa 2D (min-heap từ biên)", en: "2D trapped rain water (min-heap from border)" },
    statement: {
      vi:
        "Cho bản đồ độ cao 2D. Tính tổng lượng nước mưa giữ được sau khi mưa. " +
        "Nhập lưới: hàng cách bởi ';', giá trị cách bởi ','. VD: 1,4,3,1,3,2;3,2,1,3,2,4;2,3,3,2,3,1",
      en:
        "Given a 2D elevation map, compute the total trapped rain water after raining. " +
        "Enter grid: rows separated by ';', values by ','. e.g. 1,4,3,1,3,2;3,2,1,3,2,4;2,3,3,2,3,1",
    },
    defaultInput: "1,4,3,1,3,2;3,2,1,3,2,4;2,3,3,2,3,1",
    inputKind: "string",
    inputLabel: { vi: "Bản đồ độ cao (hàng cách ;)", en: "Elevation map (rows separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "Mức nước tại một ô bị chặn bởi TƯỜNG THẤP NHẤT bao quanh. Bắt đầu từ biên (không giữ nước).", en: "Water level at a cell is bounded by the LOWEST surrounding wall. Start from the border (holds no water)." },
      { vi: "Min-heap chứa (mức tường, r, c). Luôn xử lý ô có mức tường thấp nhất trước.", en: "Min-heap holds (boundary height, r, c). Always process the lowest boundary first." },
      { vi: "Với ô hàng xóm chưa thăm: nước giữ = max(0, mức tường - độ cao ô).", en: "For an unvisited neighbor: trapped water = max(0, boundary height - cell height)." },
      { vi: "Đẩy hàng xóm vào heap với mức tường mới = max(mức tường, độ cao ô).", en: "Push the neighbor with a new boundary = max(boundary, cell height)." },
    ],
    complexity: {
      time: "O(rows·cols·log(rows·cols))",
      space: "O(rows·cols)",
      note: {
        vi: "Mỗi ô được đẩy/lấy khỏi heap tối đa 1 lần.",
        en: "Each cell is pushed/popped from the heap at most once.",
      },
    },
    code: [
      "import heapq",
      "class Solution:",
      "    def trapRainWater(self, heightMap):",
      "        # push all border cells into a min-heap; mark visited",
      "        water = 0",
      "        while heap:",
      "            height, r, c = heapq.heappop(heap)",
      "            for nr, nc in neighbors(r, c):",
      "                water += max(0, height - heightMap[nr][nc])",
      "                heapq.heappush(heap, (max(height, heightMap[nr][nc]), nr, nc))",
      "        return water",
    ],
    builder: buildSteps407,
  },
  827: {
    id: 827,
    difficulty: "hard",
    slug: "making-a-large-island",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Making A Large Island", en: "Making A Large Island" },
    titleVi: { vi: "Tạo đảo lớn nhất (gán nhãn thành phần)", en: "Make the largest island (component labeling)" },
    statement: {
      vi:
        "Cho lưới n×n gồm 0 và 1. Được phép biến TỐI ĐA 1 ô 0 thành 1. Trả về kích thước đảo LỚN NHẤT có thể. " +
        "Nhập lưới: hàng cách bởi ';', giá trị cách bởi ','.",
      en:
        "Given an n×n grid of 0s and 1s. You may change AT MOST one 0 to 1. Return the size of the LARGEST possible island. " +
        "Enter grid: rows separated by ';', values by ','.",
    },
    defaultInput: "1,0;0,1",
    inputKind: "string",
    inputLabel: { vi: "Lưới 0/1 (hàng cách ;)", en: "0/1 grid (rows separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "DFS đệ quy: dfs(r,c,island_id) đổi grid[r][c] từ 1 → island_id (vừa gán nhãn, vừa đánh dấu đã thăm) và trả về diện tích.", en: "Recursive DFS: dfs(r,c,island_id) changes grid[r][c] from 1 → island_id (labels AND marks visited) and returns the area." },
      { vi: "Gán nhãn từng đảo với id ≥ 2, lưu size[id] = diện tích.", en: "Label each island with id ≥ 2, storing size[id] = area." },
      { vi: "best ban đầu = max(size.values()) — xử lý trường hợp lưới toàn đất.", en: "Initial best = max(size.values()) — covers the all-land case." },
      { vi: "Với mỗi ô nước (0): dùng seen để tránh cộng trùng cùng 1 đảo, cộng size các đảo kề KHÁC NHAU + 1.", en: "For each water (0) cell: use seen to avoid double-counting the same island, sum sizes of DISTINCT neighboring islands + 1." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi: "Một lượt DFS gán nhãn O(n²) + một lượt thử từng ô nước O(n²).",
        en: "One O(n²) DFS labeling pass + one O(n²) pass trying each water cell.",
      },
    },
    code: [
      "class Solution:",
      "    def largestIsland(self, grid):",
      "        n = len(grid)",
      "        size = {}",
      "        def dfs(r, c, island_id):",
      "            if r < 0 or r >= n or c < 0 or c >= n or grid[r][c] != 1:",
      "                return 0",
      "            grid[r][c] = island_id",
      "            area = 1",
      "            area += dfs(r + 1, c, island_id)",
      "            area += dfs(r - 1, c, island_id)",
      "            area += dfs(r, c + 1, island_id)",
      "            area += dfs(r, c - 1, island_id)",
      "            return area",
      "        island_id = 2",
      "        for r in range(n):",
      "            for c in range(n):",
      "                if grid[r][c] == 1:",
      "                    size[island_id] = dfs(r, c, island_id)",
      "                    island_id += 1",
      "        best = max(size.values(), default=0)",
      "        for r in range(n):",
      "            for c in range(n):",
      "                if grid[r][c] == 0:",
      "                    seen = set()",
      "                    total = 1",
      "                    for delta_r, delta_c in [(1,0),(-1,0),(0,1),(0,-1)]:",
      "                        next_r, next_c = r + delta_r, c + delta_c",
      "                        if 0 <= next_r < n and 0 <= next_c < n and grid[next_r][next_c] > 1:",
      "                            neighbor_id = grid[next_r][next_c]",
      "                            if neighbor_id not in seen:",
      "                                seen.add(neighbor_id)",
      "                                total += size[neighbor_id]",
      "                    best = max(best, total)",
      "        return best",
    ],
    builder: buildSteps827,
  },
  200: {
    id: 200,
    difficulty: "medium",
    slug: "number-of-islands",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Number of Islands", en: "Number of Islands" },
    titleVi: { vi: "Đếm số đảo trong lưới", en: "Count islands in a grid" },
    statement: {
      vi:
        "Cho grid rows×cols gồm '1' = đất và '0' = nước. Một đảo là nhóm các ô đất nối nhau theo 4 hướng " +
        "(trên, dưới, trái, phải), được bao quanh bởi nước hoặc biên grid. Hãy đếm số đảo. " +
        "Nhập grid: hàng cách bởi '|', có thể viết liền ký tự hoặc cách bằng dấu phẩy.",
      en:
        "Given a rows×cols grid of '1' land and '0' water. An island is a group of land cells connected in 4 directions " +
        "(up, down, left, right), surrounded by water or grid boundaries. Count the islands. " +
        "Enter rows separated by '|', either as compact characters or comma-separated values.",
    },
    defaultInput: "11110|11010|11000|00000",
    inputKind: "string",
    inputLabel: { vi: "Grid 0/1 (hàng cách '|')", en: "0/1 grid (rows separated by '|')" },
    approach: [
      { vi: "Duyệt từng ô trong grid. Nếu ô là nước hoặc đã thăm thì bỏ qua.", en: "Scan every cell. Skip water and already visited cells." },
      { vi: "Khi gặp đất chưa thăm tại (row, col), gọi dfs(row, col) để đánh dấu toàn bộ đảo trong visited.", en: "When unvisited land is found at (row, col), call dfs(row, col) to mark the whole island in visited." },
      { vi: "DFS thử 4 hướng; bỏ qua nếu ra ngoài biên hoặc gặp nước '0'.", en: "DFS tries 4 directions; skip out-of-bounds cells and water '0'." },
      { vi: "Sau khi dfs quay về, tăng count thêm 1 vì vừa xử lý xong một đảo.", en: "After dfs returns, increment count by 1 because one island has been fully processed." },
    ],
    complexity: {
      time: "O(rows·cols)",
      space: "O(rows·cols)",
      note: {
        vi: "Mỗi ô được thăm tối đa một lần. Bộ nhớ cho visited/stack trong trường hợp xấu nhất là O(rows·cols).",
        en: "Each cell is visited at most once. Visited/stack memory is O(rows·cols) in the worst case.",
      },
    },
    code: [
      "from typing import List",
      "",
      "class Solution:",
      "    def numIslands(self, grid: List[List[str]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        visited = [[False for col in range(cols)] for row in range(rows)]",
      "        directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]",
      "",
      "        def dfs(row, col):",
      "            visited[row][col] = True",
      "",
      "            for direction in directions:",
      "                next_row = row + direction[0]",
      "                next_col = col + direction[1]",
      "",
      "                if next_row < 0 or next_row >= rows or next_col < 0 or next_col >= cols or grid[next_row][next_col] == '0':",
      "                    continue",
      "                if not visited[next_row][next_col]:",
      "                    dfs(next_row, next_col)",
      "        ",
      "        count = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] == '1':",
      "                    if not visited[row][col]:",
      "                        dfs(row, col)",
      "                        count += 1",
      "",
      "        return count",
    ],
    builder: buildSteps200,
  },
  542: {
    id: 542,
    difficulty: "medium",
    slug: "01-matrix",
    tags: [{ key: "multi-source-bfs", vi: "Multi-source BFS", en: "Multi-source BFS" }],
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "01 Matrix", en: "01 Matrix" },
    titleVi: { vi: "Khoảng cách đến số 0 gần nhất", en: "Distance to the nearest zero" },
    statement: {
      vi:
        "Cho matrix rows×cols chỉ gồm 0 và 1, trong đó có ít nhất một ô 0. Với mỗi ô, hãy trả về khoảng cách đến ô 0 gần nhất. " +
        "Khoảng cách giữa hai ô kề cạnh là 1. Nhập các hàng cách nhau bởi '|'.",
      en:
        "Given a rows×cols binary matrix containing at least one zero, return the distance from every cell to its nearest zero. " +
        "The distance between edge-adjacent cells is 1. Enter rows separated by '|'.",
    },
    defaultInput: "0,0,0|0,1,0|1,1,1",
    inputKind: "string",
    inputLabel: { vi: "Matrix 0/1 (hàng cách '|')", en: "0/1 matrix (rows separated by '|')" },
    approach: [
      {
        vi: "Khởi tạo distances = -1. Đưa tất cả ô 0 vào queue với distance = 0.",
        en: "Initialize distances to -1. Put every zero in the queue with distance 0.",
      },
      {
        vi: "Chạy một lần multi-source BFS từ toàn bộ ô 0 cùng lúc.",
        en: "Run one multi-source BFS from all zero cells simultaneously.",
      },
      {
        vi: "Lần đầu tới một ô chưa thăm, gán distance của nó bằng distance ô hiện tại + 1 rồi enqueue.",
        en: "On the first visit to a cell, assign current distance + 1 and enqueue it.",
      },
      {
        vi: "BFS thăm theo khoảng cách tăng dần, nên lần đầu tìm thấy một ô chính là khoảng cách ngắn nhất tới số 0.",
        en: "BFS visits in increasing distance order, so a cell's first discovered distance is its shortest distance to zero.",
      },
    ],
    complexity: {
      time: "O(rows·cols)",
      space: "O(rows·cols)",
      note: {
        vi: "Mỗi ô được enqueue tối đa một lần. Matrix kết quả và queue dùng O(rows·cols) bộ nhớ.",
        en: "Each cell is enqueued at most once. The result matrix and queue use O(rows·cols) memory.",
      },
    },
    code: [
      "from collections import deque",
      "from typing import List",
      "",
      "class Solution:",
      "    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:",
      "        rows, cols = len(mat), len(mat[0])",
      "        distances = [[-1 for col in range(cols)] for row in range(rows)]",
      "        queue = deque()",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if mat[row][col] == 0:",
      "                    distances[row][col] = 0",
      "                    queue.append((row, col))",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "        while queue:",
      "            row, col = queue.popleft()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if 0 <= next_row < rows and 0 <= next_col < cols and distances[next_row][next_col] == -1:",
      "                    distances[next_row][next_col] = distances[row][col] + 1",
      "                    queue.append((next_row, next_col))",
      "        return distances",
    ],
    builder: buildSteps542,
  },
  332: {
    id: 332,
    difficulty: "hard",
    slug: "reconstruct-itinerary",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Reconstruct Itinerary", en: "Reconstruct Itinerary" },
    titleVi: { vi: "Dựng lại hành trình bay (Hierholzer DFS)", en: "Rebuild a flight itinerary (Hierholzer DFS)" },
    statement: {
      vi:
        "Cho danh sách vé bay dạng [from, to]. Tất cả vé xuất phát từ 'JFK'. " +
        "Dựng lại hành trình dùng hết tất cả vé, bắt đầu từ 'JFK'. " +
        "Nếu có nhiều hành trình hợp lệ, chọn hành trình có thứ tự từ điển nhỏ nhất. " +
        "Nhập vé dạng SRC-DST, ngăn bởi dấu phẩy. Ví dụ: JFK-MUC,MUC-LHR,LHR-SFO,SFO-SJC",
      en:
        "Given a list of airline tickets [from, to]. All tickets depart from 'JFK'. " +
        "Reconstruct the itinerary that uses all tickets, starting from 'JFK'. " +
        "If multiple valid itineraries exist, return the one with the smallest lexicographic order. " +
        "Enter tickets as SRC-DST separated by commas. Example: JFK-MUC,MUC-LHR,LHR-SFO,SFO-SJC",
    },
    defaultInput: "JFK-MUC,MUC-LHR,LHR-SFO,SFO-SJC",
    inputKind: "string",
    inputLabel: { vi: "Vé bay (SRC-DST, cách bởi ,)", en: "Tickets (SRC-DST, comma separated)" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Sort reverse + pop()", en: "Approach 1: Sort reverse + pop()" } },
          { value: "2", label: { vi: "Cách 2: Priority Queue (min-heap)", en: "Approach 2: Priority Queue (min-heap)" } },
        ],
      },
    ],
    approach: [
      { vi: "[C1] Sắp xếp vé theo thứ tự đảo ngược (reverse=True) để pop() luôn trả điểm đến nhỏ nhất theo thứ tự từ điển.", en: "[A1] Sort tickets in reverse order so .pop() always returns the lex-smallest destination." },
      { vi: "[C1] Xây dựng adjacency list: graph[src].append(dst) cho từng vé sau khi sắp xếp.", en: "[A1] Build adjacency list: graph[src].append(dst) for each ticket after sorting." },
      { vi: "[C2] Dùng min-heap mỗi node: heappush(graph[src], dst) cho từng vé — không cần sort trước.", en: "[A2] Use a min-heap per node: heappush(graph[src], dst) for each ticket — no pre-sort needed." },
      { vi: "[C1&C2] DFS Hierholzer: khi còn vé ở graph[airport], lấy điểm đến nhỏ nhất và đệ quy.", en: "[A1&A2] Hierholzer DFS: while graph[airport] has edges, get the smallest dest and recurse." },
      { vi: "[C1&C2] Append airport vào result SAU KHI tất cả cạnh đi ra từ đó đã hết (post-order). Đảo ngược result để ra hành trình.", en: "[A1&A2] Append airport to result AFTER all outgoing edges are exhausted (post-order). Reverse result for the final itinerary." },
    ],
    complexity: {
      time: "O(E log E)",
      space: "O(E)",
      note: {
        vi: "E là số vé. C1: sort O(E log E) + DFS O(E). C2: mỗi heappush/heappop O(log E) × E lần = O(E log E). Bộ nhớ cho graph + call stack là O(E).",
        en: "E is the number of tickets. A1: sort O(E log E) + DFS O(E). A2: each heappush/heappop O(log E) × E times = O(E log E). Memory for graph + call stack is O(E).",
      },
    },
    code: [
      "from collections import defaultdict",
      "class Solution:",
      "    def findItinerary(self, tickets):",
      "        graph = defaultdict(list)",
      "        for src, dst in sorted(tickets, reverse=True):",
      "            graph[src].append(dst)",
      "        result = []",
      "        def dfs(airport):",
      "            while graph[airport]:",
      "                next_dest = graph[airport].pop()",
      "                dfs(next_dest)",
      "            result.append(airport)",
      "        dfs('JFK')",
      "        return result[::-1]",
    ],
    code2: [
      "import heapq",
      "from collections import defaultdict",
      "class Solution:",
      "    def findItinerary(self, tickets):",
      "        graph = defaultdict(list)",
      "        for src, dst in tickets:",
      "            heapq.heappush(graph[src], dst)",
      "        result = []",
      "        def dfs(airport):",
      "            while graph[airport]:",
      "                next_dest = heapq.heappop(graph[airport])",
      "                dfs(next_dest)",
      "            result.append(airport)",
      "        dfs('JFK')",
      "        return result[::-1]",
    ],
    codeLabel: { vi: "Cách 1: Sort reverse + pop()", en: "Approach 1: Sort reverse + pop()" },
    code2Label: { vi: "Cách 2: Priority Queue (min-heap)", en: "Approach 2: Priority Queue (min-heap)" },
    builder: buildSteps332,
  },
  133: {
    id: 133,
    difficulty: "medium",
    slug: "clone-graph",
    category: { key: "dfs", vi: "DFS", en: "DFS" },
    title: { vi: "Clone Graph", en: "Clone Graph" },
    titleVi: { vi: "Sao chép đồ thị (DFS + hashmap)", en: "Deep copy a graph via DFS + hashmap" },
    statement: {
      vi:
        "Cho một node bất kỳ của đồ thị vô hướng liên thông (mỗi node có val và danh sách neighbors). Hãy trả về một BẢN SAO SÂU (deep copy) của đồ thị này, " +
        "bắt đầu từ node tương ứng. Đồ thị có thể chứa chu trình. Nhập cạnh 'a,b' cách bởi ';', giá trị node là số nguyên 1..n.",
      en:
        "Given a reference of one node in a connected undirected graph (each node has val and a list of neighbors), return a DEEP COPY of the graph, " +
        "starting from that corresponding node. The graph may contain cycles. Enter edges as 'a,b' separated by ';'; node values are integers 1..n.",
    },
    defaultInput: "1,2;1,4;2,3;3,4",
    inputKind: "string",
    inputLabel: { vi: "edges (a,b; ngăn bởi ;)", en: "edges (a,b; semicolon separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số node)", en: "n (nodes)" }, default: 4 },
      { key: "start", label: { vi: "node xuất phát", en: "start node" }, default: 1 },
    ],
    approach: [
      { vi: "DFS đệ quy: dfs(curr) tạo clone của curr rồi clone lần lượt các hàng xóm.", en: "Recursive DFS: dfs(curr) creates curr's clone, then clones each neighbor." },
      { vi: "Dùng hashmap visited[node gốc] = node clone để không clone trùng 1 node hai lần.", en: "Use a hashmap visited[original] = clone so no node is cloned twice." },
      { vi: "MẤU CHỐT xử lý chu trình: đăng ký visited[curr] = clone NGAY sau khi tạo clone, TRƯỚC khi đệ quy vào hàng xóm.", en: "KEY to handling cycles: register visited[curr] = clone RIGHT AFTER creating it, BEFORE recursing into neighbors." },
      { vi: "Nếu gặp lại 1 node đã có trong visited (do chu trình), trả ngay clone đã lưu, không đệ quy nữa.", en: "If a node is already in visited (due to a cycle), return its stored clone immediately instead of recursing again." },
    ],
    complexity: {
      time: "O(n + E)",
      space: "O(n)",
      note: {
        vi: "Mỗi node được clone đúng 1 lần, mỗi cạnh được xử lý đúng 1 lần từ mỗi đầu → O(n+E). Bộ nhớ cho visited + đệ quy là O(n).",
        en: "Each node is cloned exactly once, each edge processed once per endpoint → O(n+E). visited + recursion stack use O(n) memory.",
      },
    },
    code: [
      "class Node:",
      "    def __init__(self, val=0, neighbors=None):",
      "        self.val = val",
      "        self.neighbors = neighbors if neighbors is not None else []",
      "class Solution:",
      "    def cloneGraph(self, node):",
      "        if not node:",
      "            return None",
      "        visited = {}",
      "        def dfs(curr):",
      "            if curr in visited:",
      "                return visited[curr]",
      "            clone = Node(curr.val)",
      "            visited[curr] = clone",
      "            for nei in curr.neighbors:",
      "                clone.neighbors.append(dfs(nei))",
      "            return clone",
      "        return dfs(node)",
    ],
    builder: buildSteps133,
  },
  130: {
    id: 130,
    difficulty: "medium",
    slug: "surrounded-regions",
    category: { key: "dfs", vi: "DFS", en: "DFS" },
    title: { vi: "Surrounded Regions", en: "Surrounded Regions" },
    titleVi: { vi: "Bắt vùng bị bao quanh", en: "Capture surrounded regions" },
    statement: {
      vi:
        "Cho lưới m×n gồm 'X' và 'O'. Hãy bắt mọi vùng 'O' bị bao quanh 4 hướng bởi 'X' bằng cách lật chúng thành 'X'. " +
        "Một 'O' nối (4 hướng) tới 'O' nằm ở BIÊN thì KHÔNG bị bắt. Nhập lưới: hàng cách bởi '|', ký tự viết liền hoặc cách bằng dấu phẩy.",
      en:
        "Given an m×n board of 'X' and 'O', capture all regions of 'O' that are 4-directionally surrounded by 'X' by flipping them to 'X'. " +
        "An 'O' connected (4-dir) to a BORDER 'O' is NOT captured. Enter rows separated by '|', compact or comma-separated.",
    },
    defaultInput: "XXXX|XOOX|XXOX|XOXX",
    inputKind: "string",
    inputLabel: { vi: "Lưới X/O (hàng cách '|')", en: "X/O board (rows separated by '|')" },
    extraParams: [
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: DFS dùng stack ('#')", en: "Approach 1: DFS iterative ('#')" } },
        { value: "2", label: { vi: "Cách 2: DFS đệ quy ('S')", en: "Approach 2: DFS recursive ('S')" } },
      ] },
    ],
    approach: [
      { vi: "Mọi 'O' nối tới 'O' ở BIÊN thì thoát được → an toàn, không bị bắt.", en: "Any 'O' connected to a BORDER 'O' escapes → safe, not captured." },
      { vi: "Phase 1: DFS từ mọi 'O' ở biên, đánh dấu vùng nối chúng là an toàn.", en: "Phase 1: DFS from every border 'O', mark the connected region as safe." },
      { vi: "Phase 2: quét lưới — 'O' còn lại (không an toàn) → lật thành 'X'.", en: "Phase 2: scan grid — remaining unsafe 'O' → flip to 'X'." },
      { vi: "'O' an toàn giữ nguyên là 'O'.", en: "Safe 'O' cells stay as 'O'." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Mỗi ô được thăm tối đa một lần. Bộ nhớ cho stack/đánh dấu là O(m·n).",
        en: "Each cell visited at most once. Stack/marking memory is O(m·n).",
      },
    },
    code: [
      "class Solution:",
      "    def solve(self, board):",
      "        if not board or not board[0]:",
      "            return",
      "        m, n = len(board), len(board[0])",
      "        def dfs(i, j):",
      "            if i < 0 or i >= m or j < 0 or j >= n:",
      "                return",
      "            if board[i][j] != 'O':",
      "                return",
      "            board[i][j] = '#'  # mark safe",
      "            for di, dj in ((1,0),(-1,0),(0,1),(0,-1)):",
      "                dfs(i + di, j + dj)",
      "        for i in range(m):",
      "            for j in range(n):",
      "                if (i in (0, m-1) or j in (0, n-1)) and board[i][j] == 'O':",
      "                    dfs(i, j)",
      "        for i in range(m):",
      "            for j in range(n):",
      "                if board[i][j] == 'O':",
      "                    board[i][j] = 'X'   # captured",
      "                elif board[i][j] == '#':",
      "                    board[i][j] = 'O'   # restore safe",
    ],
    code2: [
      "class Solution:",
      "    def solve(self, board):",
      "        if not board or not board[0]:",
      "            return",
      "        m, n = len(board), len(board[0])",
      "        def dfs(r, c):",
      "            if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != 'O':",
      "                return",
      "            board[r][c] = 'S'",
      "            dfs(r+1, c)",
      "            dfs(r-1, c)",
      "            dfs(r, c+1)",
      "            dfs(r, c-1)",
      "        for r in range(m):",
      "            for c in range(n):",
      "                if (r == 0 or r == m-1 or c == 0 or c == n-1) and board[r][c] == 'O':",
      "                    dfs(r, c)",
      "        for r in range(m):",
      "            for c in range(n):",
      "                if board[r][c] == 'O':",
      "                    board[r][c] = 'X'",
      "                elif board[r][c] == 'S':",
      "                    board[r][c] = 'O'",
    ],
    codeLabel: { vi: "Cách 1: DFS dùng stack ('#')", en: "Approach 1: DFS iterative ('#')" },
    code2Label: { vi: "Cách 2: DFS đệ quy ('S')", en: "Approach 2: DFS recursive ('S')" },
    builder: buildStepsSurroundedRegions,
  },
  694: {
    id: 694,
    difficulty: "medium",
    premium: true,
    slug: "number-of-distinct-islands",
    category: { key: "dfs", vi: "DFS", en: "DFS" },
    title: { vi: "Number of Distinct Islands", en: "Number of Distinct Islands" },
    titleVi: { vi: "Đếm số đảo khác hình", en: "Count distinct island shapes" },
    statement: {
      vi:
        "Cho lưới m×n gồm 1 = đất và 0 = nước. Một đảo là nhóm ô đất nối nhau 4 hướng. Hai đảo được coi là GIỐNG nhau nếu " +
        "dịch chuyển tịnh tiến (không xoay, không lật) thì trùng khít. Hãy đếm số đảo KHÁC HÌNH. " +
        "Nhập lưới: hàng cách bởi '|', ký tự viết liền hoặc cách bằng dấu phẩy.",
      en:
        "Given an m×n grid of 1 land and 0 water. An island is a group of 4-directionally connected land cells. Two islands are the SAME if " +
        "one can be translated (no rotation/reflection) to equal the other. Count the number of DISTINCT island shapes. " +
        "Enter rows separated by '|', compact or comma-separated.",
    },
    defaultInput: "11000|11000|00011|00011",
    inputKind: "string",
    inputLabel: { vi: "Grid 0/1 (hàng cách '|')", en: "0/1 grid (rows separated by '|')" },
    approach: [
      { vi: "Duyệt từng ô. Gặp đất '1' chưa thăm → bắt đầu một đảo mới.", en: "Scan every cell. Unvisited land '1' → start a new island." },
      { vi: "DFS lan khắp đảo, ghi tọa độ mỗi ô TƯƠNG ĐỐI so với ô gốc → chữ ký hình dạng.", en: "DFS across the island, record each cell RELATIVE to the origin → shape signature." },
      { vi: "Bỏ chữ ký (dạng chuẩn hóa) vào một set.", en: "Add the (canonical) signature to a set." },
      { vi: "Đáp án = số chữ ký khác nhau = kích thước set.", en: "Answer = number of distinct signatures = set size." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Mỗi ô được thăm một lần trong DFS. Set lưu chữ ký tốn tối đa O(m·n).",
        en: "Each cell visited once in DFS. Signature set uses up to O(m·n).",
      },
    },
    code: [
      "class Solution:",
      "    def numDistinctIslands(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        visited = set()",
      "        def dfs(r, c, r0, c0, shape):",
      "            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] == 0:",
      "                return",
      "            grid[r][c] = 0",
      "            shape.append((r - r0, c - c0))",
      "            dfs(r + 1, c, r0, c0, shape)",
      "            dfs(r - 1, c, r0, c0, shape)",
      "            dfs(r, c + 1, r0, c0, shape)",
      "            dfs(r, c - 1, r0, c0, shape)",
      "        for i in range(m):",
      "            for j in range(n):",
      "                if grid[i][j] == 1:",
      "                    shape = []",
      "                    dfs(i, j, i, j, shape)",
      "                    visited.add(tuple(sorted(shape)))",
      "        return len(visited)",
    ],
    builder: buildStepsDistinctIslands,
  },
  2685: {
    id: 2685,
    difficulty: "medium",
    slug: "count-the-number-of-complete-components",
    category: { key: "dfs", vi: "DFS", en: "DFS" },
    title: { vi: "Count the Number of Complete Components", en: "Count the Number of Complete Components" },
    titleVi: { vi: "Đếm số component đầy đủ", en: "Count complete connected components" },
    statement: {
      vi:
        "Cho n đỉnh (0..n-1) và danh sách cạnh không hướng. Một connected component gọi là ĐẦY ĐỦ nếu mọi cặp đỉnh trong đó đều có cạnh nối (tức component có đúng k·(k-1)/2 cạnh với k đỉnh). " +
        "Đếm số component đầy đủ. Nhập cạnh: 'a,b' cách bởi ';'.",
      en:
        "Given n vertices (0..n-1) and an undirected edge list. A connected component is COMPLETE if every pair of its vertices is connected by an edge (i.e. it has exactly k·(k-1)/2 edges for k vertices). " +
        "Return the number of complete components. Enter edges as 'a,b' separated by ';'.",
    },
    defaultInput: "0,1;0,2;1,2;3,4;3,5",
    inputKind: "string",
    inputLabel: { vi: "edges (a,b; ngăn bởi ;)", en: "edges (a,b; semicolon separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số đỉnh)", en: "n (vertices)" }, default: 6 },
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: DFS iterative (stack)", en: "Approach 1: Iterative DFS (stack)" } },
        { value: "2", label: { vi: "Cách 2: DFS đệ quy trả về (nodes, degree_sum)", en: "Approach 2: Recursive DFS returning (nodes, degree_sum)" } },
      ] },
    ],
    approach: [
      { vi: "Xây adjacency list. DFS từ mỗi đỉnh chưa thăm để tìm 1 component.", en: "Build adjacency list. DFS from each unvisited node to find a component." },
      { vi: "Trong lúc DFS, đếm số đỉnh k và TỔNG BẬC của component.", en: "During DFS, count nodes k and the component's TOTAL DEGREE." },
      { vi: "Tổng bậc = 2·(số cạnh). Component đầy đủ khi total_deg == k·(k-1).", en: "Total degree = 2·(edge count). Complete when total_deg == k·(k-1)." },
      { vi: "Đáp án = số component thỏa điều kiện.", en: "Answer = number of components satisfying the condition." },
    ],
    complexity: {
      time: "O(n + E)",
      space: "O(n + E)",
      note: {
        vi: "Xây adjacency list O(E). DFS thăm mỗi đỉnh/cạnh đúng 1 lần → O(n+E).",
        en: "Build adjacency list O(E). DFS visits each node/edge once → O(n+E).",
      },
    },
    code: [
      "class Solution:",
      "    def countCompleteComponents(self, n, edges):",
      "        adj = [[] for _ in range(n)]",
      "        for a, b in edges:",
      "            adj[a].append(b)",
      "            adj[b].append(a)",
      "        visited = [False] * n",
      "        count = 0",
      "        for i in range(n):",
      "            if not visited[i]:",
      "                nodes, total_deg = [], 0",
      "                stack = [i]",
      "                visited[i] = True",
      "                while stack:",
      "                    cur = stack.pop()",
      "                    nodes.append(cur)",
      "                    total_deg += len(adj[cur])",
      "                    for nb in adj[cur]:",
      "                        if not visited[nb]:",
      "                            visited[nb] = True",
      "                            stack.append(nb)",
      "                k = len(nodes)",
      "                if total_deg == k * (k - 1):",
      "                    count += 1",
      "        return count",
    ],
    code2: [
      "class Solution:",
      "    def countCompleteComponents(self, n, edges):",
      "        graph = [[] for _ in range(n)]",
      "        for a, b in edges:",
      "            graph[a].append(b)",
      "            graph[b].append(a)",
      "        visited = [False] * n",
      "        ans = 0",
      "        def dfs(node):",
      "            visited[node] = True",
      "            nodes = 1",
      "            degree_sum = len(graph[node])",
      "            for nei in graph[node]:",
      "                if not visited[nei]:",
      "                    x, y = dfs(nei)",
      "                    nodes += x",
      "                    degree_sum += y",
      "            return nodes, degree_sum",
      "        for i in range(n):",
      "            if not visited[i]:",
      "                nodes, degree_sum = dfs(i)",
      "                edge_count = degree_sum // 2",
      "                if edge_count == nodes * (nodes - 1) // 2:",
      "                    ans += 1",
      "        return ans",
    ],
    codeLabel: { vi: "Cách 1: DFS iterative (stack)", en: "Approach 1: Iterative DFS (stack)" },
    code2Label: { vi: "Cách 2: DFS đệ quy", en: "Approach 2: Recursive DFS" },
    builder: buildSteps2685,
  },
  1971: {
    id: 1971,
    difficulty: "easy",
    slug: "find-if-path-exists-in-graph",
    category: { key: "dfs", vi: "DFS", en: "DFS" },
    title: { vi: "Find if Path Exists in Graph", en: "Find if Path Exists in Graph" },
    titleVi: { vi: "Kiểm tra tồn tại đường đi trong đồ thị", en: "Check if a path exists in the graph" },
    statement: {
      vi:
        "Cho n đỉnh (0..n-1), danh sách cạnh không hướng, hai đỉnh source và destination. Hãy kiểm tra có đường đi nào từ source tới destination không " +
        "(có thể đi qua nhiều đỉnh/cạnh trung gian). Nhập cạnh: 'a,b' cách bởi ';'.",
      en:
        "Given n vertices (0..n-1), an undirected edge list, and two nodes source and destination. Determine whether there is a valid path from source to destination " +
        "(possibly through other vertices). Enter edges as 'a,b' separated by ';'.",
    },
    defaultInput: "0,1;1,2;2,0;3,5;4,3",
    inputKind: "string",
    inputLabel: { vi: "edges (a,b; ngăn bởi ;)", en: "edges (a,b; semicolon separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số đỉnh)", en: "n (vertices)" }, default: 6 },
      { key: "source", label: { vi: "source", en: "source" }, default: 0 },
      { key: "destination", label: { vi: "destination", en: "destination" }, default: 5 },
    ],
    approach: [
      { vi: "source và destination chỉ cần nằm trong cùng connected component.", en: "source and destination just need to be in the same connected component." },
      { vi: "Xây adjacency list từ danh sách cạnh (đồ thị vô hướng).", en: "Build an adjacency list from the edge list (undirected graph)." },
      { vi: "DFS (dùng stack) từ source; nếu gặp destination thì trả True.", en: "DFS (using a stack) from source; return True if destination is reached." },
      { vi: "Nếu stack rỗng mà chưa gặp destination thì trả False.", en: "If the stack empties without reaching destination, return False." },
    ],
    complexity: {
      time: "O(n + E)",
      space: "O(n + E)",
      note: {
        vi: "Xây adjacency list O(E). DFS thăm mỗi đỉnh/cạnh tối đa một lần → O(n+E).",
        en: "Build adjacency list O(E). DFS visits each node/edge at most once → O(n+E).",
      },
    },
    code: [
      "class Solution:",
      "    def validPath(self, n, edges, source, destination):",
      "        # source and destination just need to share a component",
      "        if source == destination:",
      "            return True",
      "        adj = [[] for _ in range(n)]",
      "        for a, b in edges:",
      "            adj[a].append(b)",
      "            adj[b].append(a)",
      "        visited = [False] * n",
      "        stack = [source]",
      "        visited[source] = True",
      "        while stack:",
      "            node = stack.pop()",
      "            if node == destination:",
      "                return True",
      "            for nb in adj[node]:",
      "                if not visited[nb]:",
      "                    visited[nb] = True",
      "                    stack.append(nb)",
      "        return False",
    ],
    builder: buildSteps1971,
  },
  695: {
    id: 695,
    difficulty: "medium",
    slug: "max-area-of-island",
    category: { key: "dfs", vi: "DFS", en: "DFS" },
    title: { vi: "Max Area of Island", en: "Max Area of Island" },
    titleVi: { vi: "Diện tích đảo lớn nhất", en: "Largest island area" },
    statement: {
      vi:
        "Cho grid m×n gồm 1 = đất và 0 = nước. Diện tích của một đảo là số ô đất trong nhóm ô nối nhau theo 4 hướng. " +
        "Hãy trả về diện tích lớn nhất trong grid, hoặc 0 nếu không có đất. Nhập grid: hàng cách bởi '|', có thể viết liền ký tự hoặc cách bằng dấu phẩy.",
      en:
        "Given an m×n grid of 1 land and 0 water. An island's area is the number of land cells in a 4-directionally connected component. " +
        "Return the largest island area, or 0 if there is no land. Enter rows separated by '|', either compact or comma-separated.",
    },
    defaultInput: "0010000|0111000|0010000|0000111|0000101",
    inputKind: "string",
    inputLabel: { vi: "Grid 0/1 (hàng cách '|')", en: "0/1 grid (rows separated by '|')" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: BFS (iterative stack)", en: "Approach 1: BFS (iterative stack)" } },
          { value: "2", label: { vi: "Cách 2: DFS đệ quy", en: "Approach 2: Recursive DFS" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 (BFS): dùng stack lặp. Mỗi ô đất pop ra → area++, đẩy 4 hàng xóm đất vào stack.", en: "Approach 1 (BFS): use an iterative stack. Each land cell popped → area++, push 4 land neighbors." },
      { vi: "Cách 2 (DFS đệ quy): gọi dfs(r,c). Nếu ngoài biên hoặc grid[r][c]==0 → return 0. Ghi đè grid[r][c]=0 rồi return 1 + dfs 4 hướng.", en: "Approach 2 (recursive DFS): call dfs(r,c). If out of bounds or grid[r][c]==0 → return 0. Overwrite grid[r][c]=0 then return 1 + dfs in 4 directions." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Mỗi ô được thăm tối đa một lần.",
        en: "Each cell is visited at most once.",
      },
    },
    codeLabel: { vi: "Cách 1: BFS (iterative stack)", en: "Approach 1: BFS (iterative stack)" },
    code: [
      "class Solution:",
      "    def maxAreaOfIsland(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        max_area = 0",
      "        ",
      "        def dfs(r, c):",
      "            if r < 0 or r == m or c < 0 or c == n:",
      "                return 0",
      "            if grid[r][c] == 0:",
      "                return 0",
      "            grid[r][c] = 0",
      "            return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)",
      "        ",
      "        for r in range(m):",
      "            for c in range(n):",
      "                if grid[r][c] == 1:",
      "                    area = dfs(r, c)",
      "                    max_area = max(max_area, area)",
      "        return max_area",
    ],
    code2Label: { vi: "Cách 2: DFS đệ quy", en: "Approach 2: Recursive DFS" },
    code2: [
      "class Solution:",
      "    def maxAreaOfIsland(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        max_area = 0",
      "        def dfs(r, c):",
      "            if r < 0 or r == m or c < 0 or c == n:",
      "                return 0",
      "            if grid[r][c] == 0:",
      "                return 0",
      "            grid[r][c] = 0",
      "            return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1)",
      "        for r in range(m):",
      "            for c in range(n):",
      "                if grid[r][c] == 1:",
      "                    area = dfs(r, c)",
      "                    max_area = max(max_area, area)",
      "        return max_area",
    ],
    builder: buildSteps695,
    builder2: buildSteps695v2,
  },
  994: {
    id: 994,
    difficulty: "medium",
    slug: "rotting-oranges",
    tags: [{ key: "multi-source-bfs", vi: "Multi-source BFS", en: "Multi-source BFS" }],
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Rotting Oranges", en: "Rotting Oranges" },
    titleVi: { vi: "Cam thối lan theo từng phút", en: "Minute-by-minute rotting BFS" },
    statement: {
      vi:
        "Cho grid rows×cols: 0 = ô trống, 1 = cam tươi, 2 = cam thối. Mỗi phút, cam thối làm thối các cam tươi kề 4 hướng. " +
        "Trả về số phút tối thiểu để không còn cam tươi, hoặc -1 nếu không thể. Nhập grid: hàng cách bởi '|', giá trị có thể cách bằng dấu phẩy hoặc viết liền.",
      en:
        "Given a rows×cols grid: 0 = empty, 1 = fresh orange, 2 = rotten orange. Each minute, rotten oranges rot adjacent fresh oranges in 4 directions. " +
        "Return the minimum minutes until no fresh oranges remain, or -1 if impossible. Enter rows separated by '|', comma-separated or compact.",
    },
    defaultInput: "2,1,1|1,1,0|0,1,1",
    inputKind: "string",
    inputLabel: { vi: "Grid 0/1/2 (hàng cách '|')", en: "0/1/2 grid (rows separated by '|')" },
    approach: [
      { vi: "Đưa tất cả cam thối ban đầu vào queue cùng lúc: đây là multi-source BFS.", en: "Put all initially rotten oranges into the queue at once: this is multi-source BFS." },
      { vi: "Đếm số cam tươi ban đầu. Mỗi khi một cam tươi bị thối, fresh -= 1.", en: "Count initial fresh oranges. Whenever one rots, decrement fresh." },
      { vi: "Mỗi level BFS là 1 phút: frontier hiện tại làm thối các ô tươi kề 4 hướng.", en: "Each BFS level is 1 minute: the current frontier rots 4-directionally adjacent fresh cells." },
      { vi: "Nếu fresh = 0 thì trả số phút. Nếu queue hết mà vẫn còn fresh thì trả -1.", en: "If fresh reaches 0, return minutes. If the queue empties while fresh remains, return -1." },
    ],
    complexity: {
      time: "O(rows·cols)",
      space: "O(rows·cols)",
      note: {
        vi: "Mỗi ô được đưa vào queue tối đa một lần. Queue trong trường hợp xấu nhất chứa O(rows·cols) ô.",
        en: "Each cell enters the queue at most once. In the worst case, the queue stores O(rows·cols) cells.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def orangesRotting(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        queue = deque()",
      "        fresh = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] == 1:",
      "                    fresh += 1",
      "                elif grid[row][col] == 2:",
      "                    queue.append((row, col))",
      "        if fresh == 0:",
      "            return 0",
      "        minutes = 0",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        while queue and fresh > 0:",
      "            for index in range(len(queue)):",
      "                row, col = queue.popleft()",
      "                for delta_row, delta_col in directions:",
      "                    next_row, next_col = row + delta_row, col + delta_col",
      "                    if 0 <= next_row < rows and 0 <= next_col < cols and grid[next_row][next_col] == 1:",
      "                        grid[next_row][next_col] = 2",
      "                        fresh -= 1",
      "                        queue.append((next_row, next_col))",
      "            minutes += 1",
      "        return minutes if fresh == 0 else -1",
    ],
    builder: buildSteps994LineByLine,
  },
  1730: {
    id: 1730,
    difficulty: "medium",
    slug: "shortest-path-to-get-food",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Shortest Path to Get Food", en: "Shortest Path to Get Food" },
    titleVi: { vi: "Đường đi ngắn nhất đến thức ăn", en: "Shortest path to a food cell" },
    statement: {
      vi:
        "Cho ma trận ký tự grid gồm: '*' vị trí bắt đầu (đúng 1 ô), '#' ô thức ăn (có thể nhiều ô), " +
        "'O' ô trống đi được, 'X' vật cản. Mỗi bước chỉ đi 4 hướng (lên/xuống/trái/phải) và không qua ô 'X'. " +
        "Trả về độ dài đường đi ngắn nhất tới BẤT KỲ ô thức ăn nào, hoặc -1 nếu không có đường. " +
        "Nhập grid: mỗi hàng cách nhau bởi '|', các ký tự viết liền nhau.",
      en:
        "Given a character grid with: '*' your starting location (exactly one cell), '#' food cells (there may be several), " +
        "'O' free space, 'X' obstacles. You may only move in 4 directions (up/down/left/right) and never through 'X'. " +
        "Return the length of the shortest path to reach ANY food cell, or -1 if unreachable. " +
        "Enter the grid: rows separated by '|', characters written consecutively.",
    },
    defaultInput: "XXXXXX|X*OOOX|XOOOOX|XOO#OX|XXXXXX",
    inputKind: "string",
    inputLabel: { vi: "Grid ('*','#','O','X', hàng cách '|')", en: "Grid ('*','#','O','X', rows separated by '|')" },
    extraParams: [
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: queue lưu (r,c,dist)", en: "Approach 1: queue stores (r,c,dist)" } },
          { value: "2", label: { vi: "Cách 2: BFS theo level, size=len(queue)", en: "Approach 2: level-based BFS, size=len(queue)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: Quét grid tìm ô '*' làm điểm bắt đầu BFS. Queue lưu (r,c,dist) — mỗi phần tử tự mang khoảng cách riêng. Kiểm tra '#' ngay khi POP ra khỏi queue. Khác bài 1091: khoảng cách tính theo SỐ BƯỚC (start = 0), không theo số ô.", en: "Approach 1: Scan the grid to find the '*' cell as the BFS starting point. The queue stores (r,c,dist) — each element carries its own distance. '#' is checked right when POPPING from the queue. Unlike problem 1091: distance is counted by NUMBER OF MOVES (start = 0), not number of cells." },
      { vi: "Cách 2: Queue chỉ lưu (r,c). Dùng size = len(queue) để chốt số ô của level hiện tại trước khi vòng for thêm ô mới, distance là biến đếm CHUNG tăng dần sau mỗi level. Kiểm tra '#' ngay khi xét HÀNG XÓM (trước khi enqueue), không phải khi pop.", en: "Approach 2: The queue only stores (r,c). Uses size = len(queue) to lock in the current level's cell count before the for-loop adds new cells; distance is a SHARED counter incremented once per level. '#' is checked when examining a NEIGHBOR (before enqueueing), not when popping." },
      { vi: "Cả 2 cách đều là BFS chuẩn theo từng lớp (level-order) và luôn cho cùng đáp án ngắn nhất.", en: "Both approaches are standard level-order BFS and always produce the same shortest answer." },
    ],
    complexity: {
      time: "O(rows·cols)",
      space: "O(rows·cols)",
      note: {
        vi: "Mỗi ô vào queue tối đa 1 lần, mỗi ô xét 4 hướng.",
        en: "Each cell enters the queue at most once, each cell checks 4 directions.",
      },
    },
    codeLabel: { vi: "Cách 1: queue lưu (r,c,dist)", en: "Approach 1: queue stores (r,c,dist)" },
    code2Label: { vi: "Cách 2: BFS theo level, size=len(queue)", en: "Approach 2: level-based BFS, size=len(queue)" },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def getFood(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        start = None",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if grid[r][c] == '*':",
      "                    start = (r, c)",
      "",
      "",
      "        dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]",
      "        visited = {start}",
      "        queue = deque([(start[0], start[1], 0)])",
      "        while queue:",
      "            r, c, dist = queue.popleft()",
      "            if grid[r][c] == '#':",
      "                return dist",
      "            for dr, dc in dirs:",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != 'X' and (nr, nc) not in visited:",
      "                    visited.add((nr, nc))",
      "                    queue.append((nr, nc, dist + 1))",
      "        return -1",
    ],
    code2: [
      "class Solution:",
      "    def getFood(self, grid):",
      "        m = len(grid)",
      "        n = len(grid[0])",
      "        queue = collections.deque()",
      "        visited = set()",
      "        for i in range(m):",
      "            for j in range(n):",
      "                if grid[i][j] == '*':",
      "                    queue.append((i, j))",
      "                    visited.add((i, j))",
      "                    break",
      "        directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]",
      "        distance = 1",
      "        while queue:",
      "            size = len(queue)",
      "            for _ in range(size):",
      "                i, j = queue.popleft()",
      "                for dx, dy in directions:",
      "                    x = i + dx",
      "                    y = j + dy",
      "                    if x < 0 or x >= m or y < 0 or y >= n or grid[x][y] == 'X':",
      "                        continue",
      "                    if grid[x][y] == '#':",
      "                        return distance",
      "                    if (x, y) not in visited:",
      "                        visited.add((x, y))",
      "                        queue.append((x, y))",
      "            distance += 1",
      "        return -1",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps1730v2(input) : buildSteps1730(input);
    },
  },
  505: {
    id: 505,
    difficulty: "medium",
    slug: "the-maze-ii",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "The Maze II", en: "The Maze II" },
    titleVi: { vi: "Bóng lăn trong ma trận II", en: "Rolling ball in a maze II" },
    statement: {
      vi:
        "Một quả bóng trong ma trận với ô trống (0) và tường (1). Bóng lăn theo 1 hướng (lên/xuống/trái/phải) " +
        "và KHÔNG DỪNG cho tới khi va tường hoặc ra biên — khi đó mới có thể chọn hướng khác. " +
        "Tìm khoảng cách ngắn nhất (số ô trống đã lăn qua) để bóng DỪNG ĐÚNG tại destination. Trả -1 nếu không thể. " +
        "Nhập grid: hàng cách bởi '|', giá trị 0/1 viết liền hoặc cách bằng dấu phẩy.",
      en:
        "A ball in a maze with empty spaces (0) and walls (1). The ball rolls in one direction " +
        "(up/down/left/right) and does NOT stop until it hits a wall or the boundary — only then can it choose a new direction. " +
        "Find the shortest distance (number of empty cells traveled) for the ball to STOP exactly at the destination. Return -1 if impossible. " +
        "Enter the grid: rows separated by '|', 0/1 values either compact or comma-separated.",
    },
    defaultInput: "0,0,1,0,0|0,0,0,0,0|0,0,0,1,0|1,1,0,1,1|0,0,0,0,0",
    inputKind: "string",
    inputLabel: { vi: "Grid 0/1 (hàng cách '|')", en: "0/1 grid (rows separated by '|')" },
    extraParams: [
      { key: "startR", label: { vi: "start row", en: "start row" }, default: 0 },
      { key: "startC", label: { vi: "start col", en: "start col" }, default: 4 },
      { key: "destR", label: { vi: "dest row", en: "dest row" }, default: 4 },
      { key: "destC", label: { vi: "dest col", en: "dest col" }, default: 4 },
    ],
    approach: [
      { vi: "Bóng chỉ DỪNG khi va tường/biên — mỗi lần lăn (1 cạnh trong đồ thị) có chi phí = số ô trống đã đi qua, KHÁC NHAU giữa các cạnh.", en: "The ball only STOPS when hitting a wall/boundary — each roll (an edge in the graph) costs the number of empty cells traveled, which DIFFERS between edges." },
      { vi: "Vì trọng số cạnh không đều nhau, dùng DIJKSTRA (không phải BFS thường) — nút = vị trí DỪNG, không phải mọi ô.", en: "Since edge weights are unequal, use DIJKSTRA (not plain BFS) — nodes = STOPPING positions, not every cell." },
      { vi: "Với mỗi nút, thử lăn 4 hướng tới khi va tường/biên, rồi relax khoảng cách tới điểm dừng đó.", en: "From each node, try rolling in 4 directions until hitting a wall/boundary, then relax the distance to that stopping point." },
    ],
    complexity: {
      time: "O(mn·log(mn))",
      space: "O(mn)",
      note: {
        vi: "Mỗi ô có thể vào priority queue nhiều lần; mỗi lần xét tối đa 4 hướng, mỗi hướng tốn O(max(m,n)) để lăn.",
        en: "Each cell may enter the priority queue multiple times; each expansion checks up to 4 directions, each costing O(max(m,n)) to roll.",
      },
    },
    code: [
      "import heapq",
      "class Solution:",
      "    def shortestDistance(self, maze, start, destination):",
      "        m, n = len(maze), len(maze[0])",
      "        dist = [[float('inf')] * n for _ in range(m)]",
      "        dist[start[0]][start[1]] = 0",
      "        pq = [(0, start[0], start[1])]",
      "        dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]",
      "        while pq:",
      "            d, r, c = heapq.heappop(pq)",
      "            if d > dist[r][c]:",
      "                continue",
      "            for dr, dc in dirs:",
      "                nr, nc, steps = r, c, 0",
      "                while 0 <= nr + dr < m and 0 <= nc + dc < n and maze[nr + dr][nc + dc] == 0:",
      "                    nr += dr",
      "                    nc += dc",
      "                    steps += 1",
      "                if d + steps < dist[nr][nc]:",
      "                    dist[nr][nc] = d + steps",
      "                    heapq.heappush(pq, (dist[nr][nc], nr, nc))",
      "        ans = dist[destination[0]][destination[1]]",
      "        return ans if ans != float('inf') else -1",
    ],
    builder: buildSteps505,
  },
  1091: {
    id: 1091,
    difficulty: "medium",
    slug: "shortest-path-in-binary-matrix",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Shortest Path in Binary Matrix", en: "Shortest Path in Binary Matrix" },
    titleVi: { vi: "Đường đi ngắn nhất trong ma trận nhị phân", en: "Shortest clear path in a binary matrix" },
    statement: {
      vi:
        "Cho ma trận vuông n×n chỉ gồm 0 và 1. Clear path là đường đi từ (0,0) đến (n-1,n-1) " +
        "chỉ qua ô 0 và mỗi bước đi được 8 hướng (ngang, dọc, chéo). Trả về độ dài clear path ngắn nhất, " +
        "tính theo số ô trên đường đi, hoặc -1 nếu không có. Nhập grid: hàng cách bởi '|', giá trị có thể viết liền hoặc cách bằng dấu phẩy.",
      en:
        "Given an n×n binary matrix. A clear path goes from (0,0) to (n-1,n-1), uses only 0-cells, " +
        "and each move may go in any of 8 directions (horizontal, vertical, diagonal). Return the shortest clear path length, " +
        "counted by number of cells, or -1 if none exists. Enter rows separated by '|', either compact or comma-separated.",
    },
    defaultInput: "0,0,0|1,1,0|1,1,0",
    inputKind: "string",
    inputLabel: { vi: "Grid vuông 0/1 (hàng cách '|')", en: "Square 0/1 grid (rows separated by '|')" },
    approach: [
      { vi: "Nếu ô đầu hoặc ô cuối là 1 thì trả -1 ngay.", en: "If the start or target cell is 1, return -1 immediately." },
      { vi: "Dùng BFS từ (0,0), vì mọi cạnh có cùng cost 1.", en: "Use BFS from (0,0), because every move has equal cost 1." },
      { vi: "Mỗi ô có tối đa 8 hàng xóm: 4 hướng thẳng và 4 hướng chéo.", en: "Each cell has up to 8 neighbors: 4 straight and 4 diagonal directions." },
      { vi: "Lần đầu BFS tới (n-1,n-1) là độ dài đường đi ngắn nhất.", en: "The first time BFS reaches (n-1,n-1), that distance is the shortest path length." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi: "Mỗi ô được đưa vào queue tối đa một lần; mỗi ô xét tối đa 8 hướng. Queue/dist/parent dùng O(n²).",
        en: "Each cell enters the queue at most once; each cell checks up to 8 directions. Queue/dist/parent use O(n²).",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def shortestPathBinaryMatrix(self, grid):",
      "        n = len(grid)",
      "        if grid[0][0] or grid[n - 1][n - 1]:",
      "            return -1",
      "        dirs = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]",
      "        q = deque([(0, 0, 1)])",
      "        grid[0][0] = 1",
      "        while q:",
      "            r, c, dist = q.popleft()",
      "            if r == n - 1 and c == n - 1:",
      "                return dist",
      "            for dr, dc in dirs:",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:",
      "                    grid[nr][nc] = 1",
      "                    q.append((nr, nc, dist + 1))",
      "        return -1",
    ],
    builder: buildSteps1091,
  },
  1293: {
    id: 1293,
    difficulty: "hard",
    slug: "shortest-path-in-a-grid-with-obstacles-elimination",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Shortest Path in a Grid with Obstacles Elimination", en: "Shortest Path in a Grid with Obstacles Elimination" },
    titleVi: { vi: "Đường ngắn nhất khi được phá vật cản", en: "Shortest path with obstacle elimination" },
    statement: {
      vi: "Cho lưới m×n (0=trống, 1=vật cản). Đi 4 hướng từ (0,0) đến (m-1,n-1). Được phá TỐI ĐA k vật cản. Tìm đường ngắn nhất (hoặc -1 nếu không thể). Nhập lưới: hàng cách '|', giá trị 0/1 cách ','.",
      en: "Given an m×n grid (0=empty, 1=obstacle). Move 4 directions from (0,0) to (m-1,n-1). May eliminate AT MOST k obstacles. Find the shortest path (or -1). Enter grid: rows separated by '|', values 0/1 by ','.",
    },
    defaultInput: "0,0,0|1,1,0|0,0,0|0,1,1|0,0,0",
    inputKind: "string",
    inputLabel: { vi: "Lưới (hàng cách '|')", en: "Grid (rows separated by '|')" },
    extraParams: [
      { key: "k", label: { vi: "k (phá tối đa bao nhiêu vật cản)", en: "k (max obstacles to eliminate)" }, default: 1, min: 0, max: 64 },
    ],
    approach: [
      { vi: "Nếu k ≥ m+n-3, mọi đường Manhattan ngắn nhất đều phá được hết obstacle trung gian; trả ngay m+n-2.", en: "If k ≥ m+n-3, every intermediate obstacle on a Manhattan shortest path can be removed; return m+n-2 immediately." },
      { vi: "Nếu không, dùng BFS với state (row, col, k_còn_lại, distance). Bước vào ô trống giữ nguyên k; bước vào obstacle làm k giảm 1.", en: "Otherwise, use BFS states (row, col, k_remaining, distance). Entering an empty cell preserves k; entering an obstacle decreases k by one." },
      { vi: "best[r][c] lưu k còn lại lớn nhất từng thấy tại ô. Vì BFS tới theo distance tăng dần, state mới có k ≤ best bị state cũ vừa ngắn hơn hoặc bằng vừa còn nhiều k hơn dominate.", en: "best[r][c] stores the largest remaining k seen at the cell. Since BFS arrives by nondecreasing distance, a new state with k ≤ best is dominated by an earlier or equal-length state with at least as much k." },
      { vi: "Một ô vẫn có thể được đưa vào queue lần nữa nếu tới đó với nhiều k còn lại hơn; đây là lý do chỉ visited theo (row,col) là sai.", en: "A cell may still be queued again when reached with more remaining k; this is why visited by (row,col) alone is incorrect." },
      { vi: "Target đầu tiên được pop có distance nhỏ nhất. Visualization lưu parent theo đầy đủ state và tô đường cuối kèm obstacle đã phá.", en: "The first popped target has minimum distance. The visualization records parents by full state and highlights the final path with eliminated obstacles." },
    ],
    complexity: { time: "O(m·n·k)", space: "O(m·n·k)", note: { vi: "Mỗi ô có thể cải thiện best tối đa k+1 lần và mỗi state xét 4 hướng. Queue và parent của visualization có tối đa O(m·n·k) state; ma trận best dùng O(m·n).", en: "Each cell can improve best at most k+1 times and every state tries four directions. The queue and visualization parent hold at most O(m·n·k) states; best uses O(m·n)." } },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def shortestPath(self, grid, k):",
      "        m, n = len(grid), len(grid[0])",
      "        if k >= m + n - 3:",
      "            return m + n - 2",
      "        directions = [(0,1), (0,-1), (1,0), (-1,0)]",
      "        best = [[-1] * n for _ in range(m)]",
      "        best[0][0] = k",
      "        queue = deque([(0, 0, k, 0)])",
      "",
      "        while queue:",
      "            r, c, rem, d = queue.popleft()",
      "            if r == m-1 and c == n-1:",
      "                return d",
      "",
      "            for dr, dc in directions:",
      "                nr, nc = r+dr, c+dc",
      "                if 0<=nr<m and 0<=nc<n:",
      "                    new_rem = rem - grid[nr][nc]",
      "                    if new_rem > best[nr][nc]:",
      "                        best[nr][nc] = new_rem",
      "                        queue.append((nr, nc, new_rem, d+1))",
      "        return -1",
    ],
    builder: buildSteps1293,
  },
  3286: {
    id: 3286,
    difficulty: "medium",
    slug: "find-a-safe-walk-through-a-grid",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Find a Safe Walk Through a Grid", en: "Find a Safe Walk Through a Grid" },
    titleVi: { vi: "Tìm đường đi an toàn qua lưới", en: "Safe walk with health" },
    statement: {
      vi:
        "Cho lưới nhị phân m×n và health ban đầu. Bắt đầu ở (0,0), đi 4 hướng tới (m-1,n-1). " +
        "Khi vào một ô, mất grid[r][c] máu. Luôn phải còn máu > 0 sau khi vào ô. " +
        "Trả về true nếu tồn tại đường đi an toàn. Nhập lưới: hàng cách '|', giá trị 0/1 cách ','.",
      en:
        "Given an m×n binary grid and initial health. Start at (0,0), move 4 directions to (m-1,n-1). " +
        "Entering a cell costs grid[r][c] health. Health must remain > 0 after entering every cell. " +
        "Return true if a safe walk exists. Enter grid rows separated by '|', values 0/1 by ','.",
    },
    defaultInput: "0,1,0,0,0|0,1,0,1,0|0,0,0,1,0",
    inputKind: "string",
    inputLabel: { vi: "Lưới 0/1 (hàng cách '|')", en: "0/1 grid (rows separated by '|')" },
    extraParams: [
      { key: "health", label: { vi: "health (máu ban đầu)", en: "health (initial health)" }, default: 1 },
    ],
    approach: [
      { vi: "State BFS là (row, col, health_còn_lại), vì cùng một ô nhưng còn nhiều máu hơn thì tốt hơn.", en: "BFS state is (row, col, remaining_health), because reaching the same cell with more health is better." },
      { vi: "Khi bước vào ô mới, trừ grid[nr][nc]. Chỉ được đi tiếp nếu health mới > 0.", en: "When entering a new cell, subtract grid[nr][nc]. Continue only if the new health is > 0." },
      { vi: "Tối ưu visited bằng best[r][c] = lượng máu nhiều nhất từng có khi tới ô đó; bỏ qua state yếu hơn.", en: "Optimize visited with best[r][c] = most health ever seen at that cell; skip weaker states." },
      { vi: "BFS kết thúc thành công khi pop hoặc enqueue được ô đích với máu dương.", en: "BFS succeeds once the destination is reached with positive health." },
    ],
    complexity: {
      time: "O(m·n·health)",
      space: "O(m·n)",
      note: {
        vi: "Bản state đầy đủ có thể có m·n·health trạng thái. Visualizer giữ best health mỗi ô để cắt tỉa state yếu hơn.",
        en: "The full state space can be m·n·health. The visualizer keeps best health per cell to prune weaker states.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def findSafeWalk(self, grid, health):",
      "        m, n = len(grid), len(grid[0])",
      "        ",
      "        start_hp = health - grid[0][0]",
      "        if start_hp <= 0:",
      "            return False",
      "        ",
      "        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]",
      "        ",
      "        best = [[-1] * n for _ in range(m)]",
      "        best[0][0] = start_hp",
      "        ",
      "        q = deque([(0, 0, start_hp)])",
      "        ",
      "        while q:",
      "            r, c, hp = q.popleft()",
      "            ",
      "            if r == m - 1 and c == n - 1:",
      "                return True",
      "            ",
      "            for dr, dc in dirs:",
      "                nr, nc = r + dr, c + dc",
      "                ",
      "                if 0 <= nr < m and 0 <= nc < n:",
      "                    nhp = hp - grid[nr][nc]",
      "                    ",
      "                    if nhp > 0 and nhp > best[nr][nc]:",
      "                        best[nr][nc] = nhp",
      "                        q.append((nr, nc, nhp))",
      "        ",
      "        return False",
    ],
    builder: buildSteps3286,
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
      { vi: "Deque lưu cả current_cost; bỏ qua stale entry khi current_cost > dist[r][c].", en: "The deque stores current_cost and skips stale entries when current_cost > dist[r][c]." },
      { vi: "Đáp án là chi phí nhỏ nhất tới ô (m-1, n-1); visualization lưu parent khi relax để tô đúng đường cuối.", en: "The answer is the minimum cost to (m-1,n-1); the visualization records parent during relaxation to highlight the final path." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Grid có V=m·n node và O(V) cạnh kề. 0-1 BFS xử lý trong O(V+E)=O(m·n); dist, deque và parent dùng O(m·n).",
        en: "The grid has V=m·n nodes and O(V) neighbor edges. 0-1 BFS runs in O(V+E)=O(m·n); dist, deque, and parent use O(m·n).",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def minCost(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        directions = [(0,1), (0,-1), (1,0), (-1,0)]",
      "        dist = [[float('inf')] * n for _ in range(m)]",
      "        dist[0][0] = 0",
      "        dq = deque([(0, 0, 0)])  # cost, row, col",
      "",
      "        while dq:",
      "            current_cost, r, c = dq.popleft()",
      "            if current_cost > dist[r][c]:",
      "                continue",
      "",
      "            for direction, (dr, dc) in enumerate(directions, 1):",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < m and 0 <= nc < n:",
      "                    edge_cost = 0 if grid[r][c] == direction else 1",
      "                    new_cost = current_cost + edge_cost",
      "                    if new_cost < dist[nr][nc]:",
      "                        dist[nr][nc] = new_cost",
      "                        if edge_cost == 0:",
      "                            dq.appendleft((new_cost, nr, nc))",
      "                        else:",
      "                            dq.append((new_cost, nr, nc))",
      "        return dist[m - 1][n - 1]",
    ],
    builder: buildSteps1368,
  },
  2290: {
    id: 2290,
    difficulty: "hard",
    slug: "minimum-obstacle-removal-to-reach-corner",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Minimum Obstacle Removal to Reach Corner", en: "Minimum Obstacle Removal to Reach Corner" },
    titleVi: { vi: "Xóa ít obstacle nhất để tới góc", en: "Minimum obstacle removal to reach the corner" },
    statement: {
      vi: "Cho grid 0/1, trong đó 0 là ô trống và 1 là obstacle. Đi 4 hướng từ (0,0) tới (m-1,n-1), có thể xóa obstacle khi đi vào nó. Tìm số obstacle ít nhất phải xóa. Nhập hàng cách bởi '|', giá trị cách bởi dấu phẩy.",
      en: "Given a 0/1 grid where 0 is empty and 1 is an obstacle, move in four directions from (0,0) to (m-1,n-1), removing obstacles when entering them. Find the minimum removals. Separate rows with '|' and values with commas.",
    },
    defaultInput: "0,1,1|1,1,0|1,1,0",
    inputKind: "string",
    inputLabel: { vi: "grid 0/1 (hàng cách '|')", en: "0/1 grid (rows separated by '|')" },
    approach: [
      { vi: "Mỗi ô là một node. Đi vào ô trống 0 có edge cost 0; đi vào obstacle 1 có edge cost 1.", en: "Each cell is a node. Entering empty cell 0 has edge cost 0; entering obstacle 1 has edge cost 1." },
      { vi: "Vì mọi cạnh chỉ có trọng số 0 hoặc 1, dùng 0-1 BFS thay cho Dijkstra heap.", en: "Because every edge weight is 0 or 1, use 0-1 BFS instead of heap Dijkstra." },
      { vi: "dist[r][c] là số obstacle ít nhất đã xóa để tới ô; bỏ qua deque entry cũ khi current_cost > dist[r][c].", en: "dist[r][c] is the fewest removals to reach the cell; skip a stale deque entry when current_cost > dist[r][c]." },
      { vi: "Ô trống cost 0 dùng appendleft; obstacle cost 1 dùng append, nhờ đó trạng thái rẻ hơn luôn chạy trước.", en: "A cost-0 empty cell uses appendleft; a cost-1 obstacle uses append, so cheaper states run first." },
      { vi: "Trả dist[m-1][n-1]. Visualization lưu parent khi relax và chỉ rõ các obstacle bị xóa trên đường cuối.", en: "Return dist[m-1][n-1]. The visualization records parent during relaxation and identifies removed obstacles on the final path." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Grid có V=m·n node và O(V) cạnh kề. 0-1 BFS chạy O(V+E)=O(m·n); dist, deque và parent dùng O(m·n).",
        en: "The grid has V=m·n nodes and O(V) neighbor edges. 0-1 BFS runs in O(V+E)=O(m·n); dist, deque, and parent use O(m·n).",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def minimumObstacles(self, grid):",
      "        # 0 = empty, 1 = obstacle",
      "        rows, cols = len(grid), len(grid[0])",
      "        directions = [(0,1), (0,-1), (1,0), (-1,0)]",
      "        dist = [[float('inf')] * cols for _ in range(rows)]",
      "        dist[0][0] = 0",
      "        dq = deque([(0, 0, 0)])  # cost, row, col",
      "",
      "        while dq:",
      "            current_cost, r, c = dq.popleft()",
      "            if current_cost > dist[r][c]:",
      "                continue",
      "",
      "            for dr, dc in directions:",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < rows and 0 <= nc < cols:",
      "                    edge_cost = grid[nr][nc]",
      "                    new_cost = current_cost + edge_cost",
      "                    if new_cost < dist[nr][nc]:",
      "                        dist[nr][nc] = new_cost",
      "                        if edge_cost == 0:",
      "                            dq.appendleft((new_cost, nr, nc))",
      "                        else:",
      "                            dq.append((new_cost, nr, nc))",
      "        return dist[rows - 1][cols - 1]",
    ],
    builder: buildSteps2290,
  },
  2577: {
    id: 2577,
    difficulty: "hard",
    slug: "minimum-time-to-visit-a-cell-in-a-grid",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Minimum Time to Visit a Cell In a Grid", en: "Minimum Time to Visit a Cell In a Grid" },
    titleVi: { vi: "Thời gian nhỏ nhất để tới một ô trong grid", en: "Minimum time to visit a cell in a grid" },
    statement: {
      vi: "Cho grid, grid[r][c] là thời điểm sớm nhất được phép bước vào ô đó. Bắt đầu tại (0,0) ở t=0; mỗi giây phải đi sang một ô kề theo 4 hướng và không được đứng yên. Tìm thời gian nhỏ nhất tới góc dưới phải, hoặc -1 nếu không thể. Nhập hàng cách bởi '|', số cách bởi dấu phẩy.",
      en: "Given a grid where grid[r][c] is the earliest time that cell may be entered, start at (0,0) at t=0. Every second must move to a four-directionally adjacent cell; staying still is forbidden. Find the minimum time to reach the bottom-right corner, or -1 if impossible. Separate rows with '|' and values with commas.",
    },
    defaultInput: "0,1,3,2|5,1,2,5|4,3,8,6",
    inputKind: "string",
    inputLabel: { vi: "grid thời gian mở (hàng cách '|')", en: "unlock-time grid (rows separated by '|')" },
    approach: [
      { vi: "Kiểm tra start trước: nếu grid[0][1] > 1 và grid[1][0] > 1 thì tại t=1 không đi đâu được; vì không được đứng yên, trả -1.", en: "Check the start first: if grid[0][1] > 1 and grid[1][0] > 1, no move is possible at t=1; because staying still is forbidden, return -1." },
      { vi: "Dùng Dijkstra với dist[r][c] là thời điểm sớm nhất bước vào ô và min-heap lưu (time,row,col).", en: "Use Dijkstra with dist[r][c] as the earliest entry time and a min-heap storing (time,row,col)." },
      { vi: "Nếu hàng xóm đã mở tại time+1 thì đi vào ngay. Nếu chưa mở, phải đi qua lại trên một cạnh đã dùng để chờ theo từng chu kỳ 2 giây.", en: "If a neighbor is open at time+1, enter immediately. Otherwise, move back and forth along an available edge to wait in two-second cycles." },
      { vi: "Công thức parity: gap = grid[nr][nc] - (time+1), rồi next_time = grid[nr][nc] + gap % 2. gap chẵn tới đúng giờ mở; gap lẻ phải tới muộn thêm 1 giây.", en: "Parity formula: gap = grid[nr][nc] - (time+1), then next_time = grid[nr][nc] + gap % 2. An even gap reaches exactly at unlock; an odd gap arrives one second later." },
      { vi: "Khi đích được pop khỏi heap, time là nhỏ nhất chắc chắn. Visualization ghi thời gian tới trên từng ô và tô xanh đường tối ưu.", en: "When the target is popped from the heap, time is guaranteed minimal. The visualization labels each arrival time and highlights the optimal path in green." },
    ],
    complexity: {
      time: "O(m·n log(m·n))",
      space: "O(m·n)",
      note: {
        vi: "Grid có m·n node và O(m·n) cạnh kề. Mỗi lần dist giảm sẽ push một heap entry; dist, heap và parent của visualization dùng O(m·n) bộ nhớ.",
        en: "The grid has m·n nodes and O(m·n) neighbor edges. Each dist improvement pushes one heap entry; dist, heap, and visualization parent use O(m·n) space.",
      },
    },
    code: [
      "import heapq",
      "from typing import List",
      "",
      "class Solution:",
      "    def minimumTime(self, grid: List[List[int]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        if grid[0][1] > 1 and grid[1][0] > 1:",
      "            return -1",
      "",
      "        dist = [[float('inf')] * cols for _ in range(rows)]",
      "        dist[0][0] = 0",
      "        heap = [(0, 0, 0)]  # time, row, col",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "",
      "        while heap:",
      "            time, r, c = heapq.heappop(heap)",
      "            if time > dist[r][c]:",
      "                continue",
      "            if r == rows - 1 and c == cols - 1:",
      "                return time",
      "",
      "            for dr, dc in directions:",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < rows and 0 <= nc < cols:",
      "                    next_time = time + 1",
      "                    if next_time < grid[nr][nc]:",
      "                        wait = grid[nr][nc] - next_time",
      "                        next_time = grid[nr][nc] + wait % 2",
      "                    if next_time < dist[nr][nc]:",
      "                        dist[nr][nc] = next_time",
      "                        heapq.heappush(heap, (next_time, nr, nc))",
      "        return -1",
    ],
    builder: buildSteps2577,
  },
  3341: {
    id: 3341,
    difficulty: "medium",
    slug: "find-minimum-time-to-reach-last-room-i",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Find Minimum Time to Reach Last Room I", en: "Find Minimum Time to Reach Last Room I" },
    titleVi: { vi: "Thời gian nhỏ nhất để tới phòng cuối I", en: "Minimum time to reach the last room I" },
    statement: {
      vi: "Có dungeon gồm các phòng dạng grid. moveTime[r][c] là thời điểm sớm nhất được phép bắt đầu di chuyển vào phòng (r,c). Bắt đầu tại (0,0) ở t=0, mỗi lần đi sang phòng chung tường mất đúng 1 giây và được phép đứng chờ. Tìm thời gian nhỏ nhất tới phòng dưới cùng bên phải.",
      en: "A dungeon contains rooms arranged as a grid. moveTime[r][c] is the earliest time movement into room (r,c) may begin. Start at (0,0) at t=0; each move to a room sharing a wall takes exactly one second, and standing wait is allowed. Find the minimum time to reach the bottom-right room.",
    },
    defaultInput: "0,4|4,4",
    inputKind: "string",
    inputLabel: { vi: "moveTime (hàng cách '|')", en: "moveTime (rows separated by '|')" },
    approach: [
      { vi: "Dùng Dijkstra: dist[r][c] là thời điểm sớm nhất ĐẾN phòng (r,c), min-heap lưu (time,row,col).", en: "Use Dijkstra: dist[r][c] is the earliest ARRIVAL time at room (r,c), and the min-heap stores (time,row,col)." },
      { vi: "Để đi vào hàng xóm, thời điểm xuất phát là max(time, moveTime[nr][nc]): nếu phòng chưa sẵn sàng thì đứng tại phòng hiện tại để chờ.", en: "To enter a neighbor, departure time is max(time, moveTime[nr][nc]): if the room is not ready, stand in the current room and wait." },
      { vi: "Di chuyển mất 1 giây, nên thời điểm đến là next_time = max(time, moveTime[nr][nc]) + 1. Dấu +1 nằm ngoài max().", en: "Movement takes one second, so arrival is next_time = max(time, moveTime[nr][nc]) + 1. The +1 sits outside max()." },
      { vi: "Khác bài 2577: bài này được đứng yên để chờ, vì vậy không cần kiểm tra kẹt ở start và không cần công thức parity.", en: "Unlike problem 2577, standing still to wait is allowed here, so there is no trapped-start check and no parity formula." },
      { vi: "Khi phòng cuối được pop khỏi heap, time đã tối ưu. Visualization tô xanh đường đi và ghi rõ thời gian chờ, xuất phát, đến.", en: "When the last room is popped from the heap, time is optimal. The visualization highlights the route and labels waiting, departure, and arrival times." },
    ],
    complexity: {
      time: "O(m·n log(m·n))",
      space: "O(m·n)",
      note: {
        vi: "Dungeon có m·n phòng và O(m·n) cạnh kề. Mỗi lần dist giảm sẽ push một heap entry; dist, heap và parent của visualization dùng O(m·n) bộ nhớ.",
        en: "The dungeon has m·n rooms and O(m·n) neighbor edges. Each dist improvement pushes one heap entry; dist, heap, and visualization parent use O(m·n) space.",
      },
    },
    code: [
      "import heapq",
      "from typing import List",
      "",
      "class Solution:",
      "    def minTimeToReach(self, moveTime: List[List[int]]) -> int:",
      "        rows, cols = len(moveTime), len(moveTime[0])",
      "        dist = [[float('inf')] * cols for _ in range(rows)]",
      "        dist[0][0] = 0",
      "        heap = [(0, 0, 0)]  # time, row, col",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "",
      "        while heap:",
      "            time, r, c = heapq.heappop(heap)",
      "            if time > dist[r][c]:",
      "                continue",
      "            if r == rows - 1 and c == cols - 1:",
      "                return time",
      "",
      "            for dr, dc in directions:",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < rows and 0 <= nc < cols:",
      "                    next_time = max(time, moveTime[nr][nc]) + 1",
      "                    if next_time < dist[nr][nc]:",
      "                        dist[nr][nc] = next_time",
      "                        heapq.heappush(heap, (next_time, nr, nc))",
      "        return -1",
    ],
    builder: buildSteps3341,
  },
  3342: {
    id: 3342,
    difficulty: "medium",
    slug: "find-minimum-time-to-reach-last-room-ii",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Find Minimum Time to Reach Last Room II", en: "Find Minimum Time to Reach Last Room II" },
    titleVi: { vi: "Thời gian nhỏ nhất để tới phòng cuối II", en: "Minimum time to reach the last room II" },
    statement: {
      vi: "Có dungeon gồm các phòng dạng grid. moveTime[r][c] là thời điểm sớm nhất được phép bắt đầu di chuyển vào phòng đó. Bắt đầu tại (0,0) ở t=0 và được đứng chờ. Các lượt di chuyển mất lần lượt 1 giây, 2 giây, 1 giây, 2 giây... Tìm thời gian nhỏ nhất tới phòng dưới cùng bên phải.",
      en: "A dungeon contains rooms arranged as a grid. moveTime[r][c] is the earliest time movement into that room may begin. Start at (0,0) at t=0, and standing wait is allowed. Move durations alternate one second, two seconds, one second, two seconds... Find the minimum time to reach the bottom-right room.",
    },
    defaultInput: "0,4|4,4",
    inputKind: "string",
    inputLabel: { vi: "moveTime (hàng cách '|')", en: "moveTime (rows separated by '|')" },
    approach: [
      { vi: "Dùng Dijkstra với dist[r][c] là thời điểm sớm nhất ĐẾN phòng (r,c), min-heap lưu (time,row,col).", en: "Use Dijkstra with dist[r][c] as the earliest ARRIVAL time at room (r,c), and a min-heap storing (time,row,col)." },
      { vi: "Mỗi bước sang phòng kề làm r+c đổi chẵn ↔ lẻ. Mọi đường tới cùng một ô có số bước cùng parity, vì mọi vòng quay lại trong grid có độ dài chẵn.", en: "Every adjacent move flips r+c parity. Every route to the same cell has the same move-count parity because every returning cycle in a grid has even length." },
      { vi: "Nếu (r+c) chẵn thì lượt tiếp theo là lượt lẻ, move_cost=1; nếu lẻ thì lượt tiếp theo là lượt chẵn, move_cost=2.", en: "If (r+c) is even, the next move is odd-indexed and move_cost=1; if odd, the next move is even-indexed and move_cost=2." },
      { vi: "Tính depart_time = max(time, moveTime[nr][nc]), rồi next_time = depart_time + move_cost. Có thể đứng tại phòng hiện tại để chờ.", en: "Compute depart_time = max(time, moveTime[nr][nc]), then next_time = depart_time + move_cost. Waiting in the current room is allowed." },
      { vi: "Khác bài 3341 chỉ ở move_cost luân phiên. Visualization ghi rõ parity, thời gian chờ, thời lượng từng lượt và tô xanh đường tối ưu.", en: "The only difference from problem 3341 is the alternating move_cost. The visualization labels parity, waiting, each move duration, and the optimal green path." },
    ],
    complexity: {
      time: "O(m·n log(m·n))",
      space: "O(m·n)",
      note: {
        vi: "Dungeon có m·n phòng và O(m·n) cạnh kề. Parity của lượt đi được suy ra từ r+c nên không cần thêm chiều state; dist, heap và parent dùng O(m·n).",
        en: "The dungeon has m·n rooms and O(m·n) neighbor edges. Move parity is derived from r+c, so no extra state dimension is needed; dist, heap, and parent use O(m·n).",
      },
    },
    code: [
      "import heapq",
      "from typing import List",
      "",
      "class Solution:",
      "    def minTimeToReach(self, moveTime: List[List[int]]) -> int:",
      "        rows, cols = len(moveTime), len(moveTime[0])",
      "        dist = [[float('inf')] * cols for _ in range(rows)]",
      "        dist[0][0] = 0",
      "        heap = [(0, 0, 0)]  # time, row, col",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "",
      "        while heap:",
      "            time, r, c = heapq.heappop(heap)",
      "            if time > dist[r][c]:",
      "                continue",
      "            if r == rows - 1 and c == cols - 1:",
      "                return time",
      "",
      "            for dr, dc in directions:",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < rows and 0 <= nc < cols:",
      "                    move_cost = 1 if (r + c) % 2 == 0 else 2",
      "                    depart_time = max(time, moveTime[nr][nc])",
      "                    next_time = depart_time + move_cost",
      "                    if next_time < dist[nr][nc]:",
      "                        dist[nr][nc] = next_time",
      "                        heapq.heappush(heap, (next_time, nr, nc))",
      "        return -1",
    ],
    builder: buildSteps3342,
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
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: BFS một chiều", en: "Approach 1: One-way BFS" } },
          { value: "2", label: { vi: "Cách 2: Bidirectional BFS (nhanh hơn)", en: "Approach 2: Bidirectional BFS (faster)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 — BFS một chiều: expand từ beginWord ra ngoài đến khi gặp endWord.", en: "Approach 1 — One-way BFS: expand outward from beginWord until endWord is reached." },
      { vi: "Cách 2 — Bidirectional BFS: mở rộng đồng thời từ 2 đầu (begin và end). Luôn expand frontier NHỎ HƠN.", en: "Approach 2 — Bidirectional BFS: expand simultaneously from both ends (begin and end). Always expand the SMALLER frontier." },
      { vi: "Bidirectional: số node xét ~2·b^(d/2) thay vì b^d → nhanh hơn ~2–10× trong thực tế.", en: "Bidirectional: nodes visited ~2·b^(d/2) instead of b^d → ~2–10× faster in practice." },
    ],
    complexity: {
      time: "O(N·L²)",
      space: "O(N·L)",
      note: {
        vi: "Cả 2 cách đều O(N·L²) worst-case, nhưng Bidirectional thực tế nhanh hơn nhiều vì gặp nhau ở giữa.",
        en: "Both are O(N·L²) worst-case, but Bidirectional is much faster in practice due to meeting in the middle.",
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
    code2: [
      "class Solution:",
      "    def ladderLength(self, beginWord, endWord, wordList):",
      "        word_set = set(wordList)",
      "        if endWord not in word_set: return 0",
      "        front, back = {beginWord}, {endWord}",
      "        visited_f, visited_b = {beginWord}, {endWord}",
      "        steps = 1",
      "        while front and back:",
      "            steps += 1",
      "            # Always expand the smaller frontier",
      "            if len(front) > len(back):",
      "                front, back = back, front",
      "                visited_f, visited_b = visited_b, visited_f",
      "            nxt = set()",
      "            for word in front:",
      "                for i in range(len(word)):",
      "                    for c in 'abcdefghijklmnopqrstuvwxyz':",
      "                        nw = word[:i] + c + word[i+1:]",
      "                        if nw in back: return steps   # MET!",
      "                        if nw in word_set and nw not in visited_f:",
      "                            nxt.add(nw); visited_f.add(nw)",
      "            front = nxt",
      "        return 0",
    ],
    codeLabel:  { vi: "Cách 1: BFS một chiều", en: "Approach 1: One-way BFS" },
    code2Label: { vi: "Cách 2: Bidirectional BFS", en: "Approach 2: Bidirectional BFS" },
    builder: buildSteps127,
  },
  1334: {
    id: 1334,
    difficulty: "medium",
    slug: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", en: "Find the City With the Smallest Number of Neighbors at a Threshold Distance" },
    titleVi: { vi: "Thành phố có ít láng giềng nhất trong ngưỡng", en: "City with fewest neighbors within threshold" },
    statement: {
      vi:
        "Cho n thành phố (0..n-1) nối bởi các cạnh 2 chiều có trọng số, và một ngưỡng khoảng cách threshold. " +
        "Với mỗi thành phố, đếm số thành phố KHÁC có thể đến được trong khoảng cách ≤ threshold (đường ngắn nhất). " +
        "Trả về thành phố có SỐ LƯỢNG ÍT NHẤT; nếu hòa, trả về thành phố có INDEX LỚN NHẤT.",
      en:
        "Given n cities (0..n-1) connected by weighted bidirectional edges, and a distance threshold. " +
        "For each city, count how many OTHER cities are reachable within distance ≤ threshold (shortest path). " +
        "Return the city with the FEWEST such neighbors; if tied, return the city with the LARGEST index.",
    },
    defaultInput: "0-1-3,1-2-1,1-3-4,2-3-1",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (u-v-w, cách bởi dấu phẩy)", en: "Edges (u-v-w, comma separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số thành phố)", en: "n (number of cities)" }, default: 4 },
      { key: "threshold", label: { vi: "threshold (ngưỡng)", en: "threshold" }, default: 4 },
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Floyd-Warshall", en: "Approach 1: Floyd-Warshall" } },
          { value: "2", label: { vi: "Cách 2: Dijkstra từ mỗi thành phố", en: "Approach 2: Dijkstra from every city" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 (Floyd-Warshall): tính dist[i][j] = khoảng cách ngắn nhất giữa MỌI cặp thành phố, O(n³). Với mỗi thành phố i, đếm số j≠i có dist[i][j] ≤ threshold. Chọn thành phố có số đếm NHỎ NHẤT; nếu hòa, ưu tiên INDEX LỚN HƠN.", en: "Approach 1 (Floyd-Warshall): compute dist[i][j] = shortest path between EVERY pair of cities, O(n³). For each city i, count j≠i where dist[i][j] ≤ threshold. Pick the city with the SMALLEST count; ties favor the LARGER index." },
      { vi: "Cách 2 (Dijkstra): chạy Dijkstra n LẦN — mỗi lần từ 1 thành phố nguồn — lấp đầy ma trận dist theo từng HÀNG. Kết quả giống Floyd-Warshall nhưng thường nhanh hơn trên đồ thị thưa vì chỉ duyệt cạnh thật, không thử mọi (i,k,j).", en: "Approach 2 (Dijkstra): run Dijkstra n TIMES — once per source city — filling the dist matrix one ROW at a time. Same result as Floyd-Warshall but usually faster on sparse graphs since it only explores actual edges instead of trying every (i,k,j)." },
    ],
    complexity: {
      time: "O(n³) cả 2 cách",
      space: "O(n²)",
      note: {
        vi: "Floyd-Warshall và Dijkstra×n đều O(n³) trong trường hợp xấu nhất; ma trận dist tốn O(n²).",
        en: "Both Floyd-Warshall and Dijkstra×n are O(n³) worst case; the dist matrix uses O(n²) space.",
      },
    },
    codeLabel: { vi: "Cách 1: Floyd-Warshall", en: "Approach 1: Floyd-Warshall" },
    code2Label: { vi: "Cách 2: Dijkstra từ mỗi thành phố", en: "Approach 2: Dijkstra from every city" },
    code: [
      "class Solution:",
      "    def findTheCity(self, n, edges, threshold):",
      "        dist = [[float('inf')] * n for _ in range(n)]",
      "        for i in range(n):",
      "            dist[i][i] = 0",
      "        for u, v, w in edges:",
      "            dist[u][v] = dist[v][u] = w",
      "        for k in range(n):",
      "            for i in range(n):",
      "                for j in range(n):",
      "                    if dist[i][k] + dist[k][j] < dist[i][j]:",
      "                        dist[i][j] = dist[i][k] + dist[k][j]",
      "        counts = [sum(1 for j in range(n) if j != i and dist[i][j] <= threshold) for i in range(n)]",
      "        best = 0",
      "        for i in range(1, n):",
      "            if counts[i] <= counts[best]:",
      "                best = i",
      "        return best",
    ],
    code2: [
      "class Solution:",
      "    def findTheCity(self, n, edges, threshold):",
      "        dist = [[float('inf')] * n for _ in range(n)]",
      "        adj = [[] for _ in range(n)]",
      "        for u, v, w in edges:",
      "            adj[u].append((v, w))",
      "            adj[v].append((u, w))",
      "        for src in range(n):",
      "            dist[src][src] = 0",
      "            visited = [False] * n",
      "            while True:",
      "                u = min((c for c in range(n) if not visited[c]), key=lambda c: dist[src][c], default=-1)",
      "                if u == -1 or dist[src][u] == float('inf'):",
      "                    break",
      "                visited[u] = True",
      "                for v, w in adj[u]:",
      "                    if dist[src][u] + w < dist[src][v]:",
      "                        dist[src][v] = dist[src][u] + w",
      "        counts = [sum(1 for j in range(n) if j != i and dist[i][j] <= threshold) for i in range(n)]",
      "        best = 0",
      "        for i in range(1, n):",
      "            if counts[i] <= counts[best]:",
      "                best = i",
      "        return best",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps1334Dijkstra(input, params) : buildSteps1334(input, params);
    },
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
    approach: [
      { vi: "Xây adjacency list graph[u] = [(v, w), ...] cho đồ thị có hướng.", en: "Build the directed adjacency list graph[u] = [(v, w), ...]." },
      { vi: "dist[x] là thời gian ngắn nhất đã biết để tín hiệu tới x. Khởi tạo dist[k] = 0, các node khác = ∞.", en: "dist[x] is the shortest known signal arrival time at x. Initialize dist[k] = 0 and all other nodes to ∞." },
      { vi: "Min-heap lưu (distance, node). Mỗi lần pop trạng thái có distance nhỏ nhất; bỏ qua nếu d > dist[u] vì đó là bản ghi cũ.", en: "The min-heap stores (distance, node). Pop the smallest distance and skip it when d > dist[u] because it is stale." },
      { vi: "Relax cạnh u → v bằng new_dist = d + w. Nếu nhỏ hơn dist[v], cập nhật dist[v] và push trạng thái mới.", en: "Relax edge u → v with new_dist = d + w. If it improves dist[v], update it and push the new state." },
      { vi: "Sau khi heap rỗng, đáp án là max(dist). Nếu max là ∞ thì có node không tới được và trả -1.", en: "After the heap empties, the answer is max(dist). If it is ∞, some node is unreachable, so return -1." },
    ],
    complexity: {
      time: "O((V+E) log V)",
      space: "O(V + E)",
      note: {
        vi: "Mỗi lần relax thành công sẽ push một heap entry; bản ghi cũ được bỏ qua khi pop. Tổng thời gian O((V+E) log V), bộ nhớ O(V+E).",
        en: "Each successful relaxation pushes a heap entry; stale entries are skipped when popped. Total time is O((V+E) log V), with O(V+E) space.",
      },
    },
    code: [
      "import heapq",
      "from collections import defaultdict",
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
      "                new_dist = d + w",
      "                if new_dist < dist[v]:",
      "                    dist[v] = new_dist",
      "                    heapq.heappush(heap, (dist[v], v))",
      "        ans = max(dist.values())",
      "        return ans if ans < float('inf') else -1",
    ],
    builder: buildSteps743,
  },
  787: {
    id: 787,
    difficulty: "medium",
    slug: "cheapest-flights-within-k-stops",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Cheapest Flights Within K Stops", en: "Cheapest Flights Within K Stops" },
    titleVi: { vi: "Chuyến bay rẻ nhất trong K điểm dừng", en: "Cheapest flight within K stops" },
    statement: {
      vi: "Cho n thành phố và các chuyến bay có hướng [from, to, price]. Tìm giá rẻ nhất từ src tới dst với tối đa k điểm dừng ở giữa. Nếu không có đường hợp lệ, trả -1. Nhập chuyến bay dạng 'u,v,price', ngăn cách bằng dấu ';'.",
      en: "Given n cities and directed flights [from, to, price], find the cheapest price from src to dst with at most k intermediate stops. Return -1 if no valid route exists. Enter flights as 'u,v,price' separated by ';'.",
    },
    defaultInput: "0,1,100;1,2,100;2,0,100;1,3,600;2,3,200",
    inputKind: "string",
    inputLabel: { vi: "flights (u,v,price; ...)", en: "flights (u,v,price; ...)" },
    extraParams: [
      { key: "n", label: { vi: "n (số thành phố)", en: "n (cities)" }, default: 4 },
      { key: "src", label: { vi: "src (điểm đi)", en: "src (source)" }, default: 0 },
      { key: "dst", label: { vi: "dst (điểm đến)", en: "dst (destination)" }, default: 3 },
      { key: "k", label: { vi: "k (tối đa điểm dừng)", en: "k (maximum stops)" }, default: 1 },
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Bellman-Ford giới hạn", en: "Approach 1: Bounded Bellman-Ford" } },
          { value: "2", label: { vi: "Cách 2: Dijkstra + trạng thái", en: "Approach 2: State Dijkstra" } },
        ],
      },
    ],
    approach: [
      { vi: "Cả hai cách đều đổi giới hạn: tối đa k điểm dừng ở giữa nghĩa là tối đa k + 1 chuyến bay (cạnh).", en: "Both approaches translate the limit: at most k intermediate stops means at most k + 1 flights (edges)." },
      { vi: "Cách 1 — Bellman-Ford giới hạn: chạy k + 1 vòng; mỗi vòng chỉ đọc cost cũ và ghi sang next_cost.", en: "Approach 1 — Bounded Bellman-Ford: run k + 1 rounds; each round reads old cost and writes to next_cost." },
      { vi: "Cách 2 — Dijkstra trạng thái: min-heap chứa (price, city, flights_used), ưu tiên tổng giá nhỏ nhất.", en: "Approach 2 — State Dijkstra: the min-heap stores (price, city, flights_used), prioritizing the smallest total price." },
      { vi: "Dijkstra phải lưu best[city][flights_used]. Chỉ lưu best[city] sẽ trộn các đường có số chuyến khác nhau và có thể loại nhầm đường hợp lệ.", en: "Dijkstra must store best[city][flights_used]. Keeping only best[city] mixes routes with different flight counts and can discard a valid route." },
      { vi: "Khi Dijkstra pop dst khỏi heap, có thể trả ngay vì đó là trạng thái hợp lệ có tổng giá nhỏ nhất.", en: "When Dijkstra pops dst from the heap, it can return immediately because this is the cheapest valid state." },
    ],
    complexity: {
      time: "O((k + 1)·E) / O(k·E log(nk))",
      space: "O(n) / O(nk + E)",
      note: {
        vi: "Cách 1 dùng hai mảng n phần tử. Cách 2 có tối đa n·(k+2) trạng thái trong bảng best/heap và adjacency list E cạnh.",
        en: "Approach 1 uses two n-entry arrays. Approach 2 has at most n·(k+2) states in best/heap plus an E-edge adjacency list.",
      },
    },
    code: [
      "from typing import List",
      "",
      "class Solution:",
      "    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:",
      "        INF = float('inf')",
      "        cost = [INF] * n",
      "        cost[src] = 0",
      "",
      "        for used in range(k + 1):",
      "            next_cost = cost[:]",
      "            for u, v, price in flights:",
      "                if cost[u] != INF:",
      "                    next_cost[v] = min(next_cost[v], cost[u] + price)",
      "            cost = next_cost",
      "",
      "        return -1 if cost[dst] == INF else cost[dst]",
    ],
    code2: [
      "import heapq",
      "from collections import defaultdict",
      "from typing import List",
      "",
      "class Solution:",
      "    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:",
      "        graph = defaultdict(list)",
      "        for u, v, ticket in flights:",
      "            graph[u].append((v, ticket))",
      "",
      "        max_flights = k + 1",
      "        best = [[float('inf')] * (max_flights + 1) for _ in range(n)]",
      "        best[src][0] = 0",
      "        heap = [(0, src, 0)]  # price, city, flights_used",
      "",
      "        while heap:",
      "            price, u, used = heapq.heappop(heap)",
      "            if u == dst: return price",
      "            if price != best[u][used]: continue",
      "            if used == max_flights: continue",
      "",
      "            for v, ticket in graph[u]:",
      "                new_price = price + ticket",
      "                next_used = used + 1",
      "                if new_price < best[v][next_used]:",
      "                    best[v][next_used] = new_price",
      "                    heapq.heappush(heap, (new_price, v, next_used))",
      "        return -1",
    ],
    codeLabel: { vi: "Cách 1: Bellman-Ford giới hạn", en: "Approach 1: Bounded Bellman-Ford" },
    code2Label: { vi: "Cách 2: Dijkstra + trạng thái", en: "Approach 2: State Dijkstra" },
    builder: buildSteps787,
  },
  1514: {
    id: 1514,
    difficulty: "medium",
    slug: "path-with-maximum-probability",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Path with Maximum Probability", en: "Path with Maximum Probability" },
    titleVi: { vi: "Đường đi có xác suất lớn nhất", en: "Path with maximum probability" },
    statement: {
      vi: "Cho đồ thị vô hướng gồm n node 0..n-1. Mỗi cạnh [a,b] có xác suất đi qua thành công succProb tương ứng. Tìm đường từ start_node tới end_node có tích xác suất lớn nhất; không có đường thì trả 0. Nhập mỗi cạnh dạng 'a-b-probability', ngăn cách bằng dấu phẩy.",
      en: "Given an undirected graph with nodes 0..n-1, each edge [a,b] has a corresponding success probability. Find the path from start_node to end_node with the maximum product of probabilities; return 0 if unreachable. Enter each edge as 'a-b-probability', separated by commas.",
    },
    defaultInput: "0-1-0.5,1-2-0.5,0-2-0.2",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (a-b-probability, cách bởi dấu phẩy)", en: "Edges (a-b-probability, comma separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số node)", en: "n (nodes)" }, default: 3 },
      { key: "start_node", label: { vi: "start_node", en: "start_node" }, default: 0 },
      { key: "end_node", label: { vi: "end_node", en: "end_node" }, default: 2 },
    ],
    approach: [
      { vi: "Đồ thị vô hướng: với mỗi cạnh [a,b], thêm cả a → b và b → a vào adjacency list.", en: "The graph is undirected: for every [a,b], add both a → b and b → a to the adjacency list." },
      { vi: "best[x] là xác suất lớn nhất đã biết để tới x. Khởi tạo best[start_node] = 1.", en: "best[x] is the largest known probability of reaching x. Initialize best[start_node] = 1." },
      { vi: "Dùng max-heap để luôn xử lý đường có xác suất lớn nhất trước. Python mô phỏng max-heap bằng cách lưu xác suất âm.", en: "Use a max-heap to process the highest-probability path first. Python simulates it by storing negative probabilities." },
      { vi: "Relax cạnh bằng phép nhân: new_prob = prob × edge_prob. Cập nhật khi new_prob > best[v].", en: "Relax an edge by multiplication: new_prob = prob × edge_prob. Update when new_prob > best[v]." },
      { vi: "Khi end_node được pop khỏi heap, có thể trả ngay vì không còn trạng thái nào có xác suất lớn hơn.", en: "When end_node is popped from the heap, return immediately because no remaining state has a larger probability." },
    ],
    complexity: {
      time: "O((V + E) log V)",
      space: "O(V + E)",
      note: {
        vi: "Mỗi lần cải thiện xác suất sẽ push một heap entry; stale entry được bỏ qua khi pop. Adjacency list của đồ thị vô hướng chứa 2E hướng.",
        en: "Each probability improvement pushes a heap entry; stale entries are skipped when popped. The undirected adjacency list stores 2E directions.",
      },
    },
    code: [
      "import heapq",
      "from collections import defaultdict",
      "from typing import List",
      "",
      "class Solution:",
      "    def maxProbability(self, n: int, edges: List[List[int]], succProb: List[float], start_node: int, end_node: int) -> float:",
      "        graph = defaultdict(list)",
      "        for (a, b), probability in zip(edges, succProb):",
      "            graph[a].append((b, probability))",
      "            graph[b].append((a, probability))",
      "",
      "        best = [0.0] * n",
      "        best[start_node] = 1.0",
      "        heap = [(-1.0, start_node)]",
      "",
      "        while heap:",
      "            neg_prob, u = heapq.heappop(heap)",
      "            prob = -neg_prob",
      "            if prob < best[u]:",
      "                continue",
      "            if u == end_node:",
      "                return prob",
      "",
      "            for v, edge_prob in graph[u]:",
      "                new_prob = prob * edge_prob",
      "                if new_prob > best[v]:",
      "                    best[v] = new_prob",
      "                    heapq.heappush(heap, (-new_prob, v))",
      "        return 0.0",
    ],
    builder: buildSteps1514,
  },
  778: {
    id: 778,
    difficulty: "hard",
    slug: "swim-in-rising-water",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Swim in Rising Water", en: "Swim in Rising Water" },
    titleVi: { vi: "Bơi trong nước đang dâng", en: "Swim in rising water" },
    statement: {
      vi: "Cho grid n×n, grid[r][c] là độ cao của ô. Tại thời điểm t, mực nước là t và chỉ có thể bơi qua các ô có độ cao ≤ t theo 4 hướng. Tìm thời điểm nhỏ nhất để đi từ (0,0) tới (n-1,n-1). Nhập hàng cách bởi '|' hoặc ';', số cách bởi dấu phẩy.",
      en: "Given an n×n grid where grid[r][c] is elevation, at time t the water level is t and swimming may use cells with elevation ≤ t in four directions. Find the minimum time to travel from (0,0) to (n-1,n-1). Separate rows with '|' or ';' and values with commas.",
    },
    defaultInput: "0,2|1,3",
    inputKind: "string",
    inputLabel: { vi: "grid độ cao (hàng cách '|')", en: "elevation grid (rows separated by '|')" },
    approach: [
      { vi: "Xem mỗi ô là một node; best[r][c] là thời điểm sớm nhất có thể tới ô đó.", en: "Treat each cell as a node; best[r][c] is the earliest time that cell can be reached." },
      { vi: "Khởi tạo best[0][0] = grid[0][0], vì phải chờ nước phủ được ngay ô xuất phát.", en: "Initialize best[0][0] = grid[0][0], because water must first cover the start cell." },
      { vi: "Dijkstra dùng min-heap (time,row,col), luôn xử lý ô có thời gian tới nhỏ nhất và bỏ qua stale entry.", en: "Dijkstra uses a min-heap of (time,row,col), processes the earliest reachable cell first, and skips stale entries." },
      { vi: "Điểm mấu chốt: new_time = max(time, grid[nr][nc]). Thời gian của đường là độ cao lớn nhất đã gặp, không phải tổng và không phải chênh lệch hai ô.", en: "Key point: new_time = max(time, grid[nr][nc]). A route's time is its maximum visited elevation, not a sum or adjacent-cell difference." },
      { vi: "Khi ô đích được pop, time đã tối ưu nên trả ngay.", en: "When the target is popped, time is optimal, so return immediately." },
    ],
    complexity: {
      time: "O(n² log(n²))",
      space: "O(n²)",
      note: {
        vi: "Grid có n² node và tối đa 4n² lượt xét hàng xóm. Mỗi lần best giảm sẽ push một heap entry; best, heap và parent của visualization dùng O(n²) bộ nhớ.",
        en: "The grid has n² nodes and at most 4n² neighbor checks. Each best-time improvement pushes a heap entry; best, heap, and visualization parent use O(n²) space.",
      },
    },
    code: [
      "import heapq",
      "from typing import List",
      "",
      "class Solution:",
      "    def swimInWater(self, grid: List[List[int]]) -> int:",
      "        n = len(grid)",
      "        best = [[float('inf')] * n for _ in range(n)]",
      "        best[0][0] = grid[0][0]",
      "        heap = [(grid[0][0], 0, 0)]  # time, row, col",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "",
      "        while heap:",
      "            time, r, c = heapq.heappop(heap)",
      "            if time > best[r][c]:",
      "                continue",
      "            if r == n - 1 and c == n - 1:",
      "                return time",
      "",
      "            for dr, dc in directions:",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < n and 0 <= nc < n:",
      "                    new_time = max(time, grid[nr][nc])",
      "                    if new_time < best[nr][nc]:",
      "                        best[nr][nc] = new_time",
      "                        heapq.heappush(heap, (new_time, nr, nc))",
      "        return -1",
    ],
    builder: buildSteps778,
  },
  1976: {
    id: 1976,
    difficulty: "medium",
    slug: "number-of-ways-to-arrive-at-destination",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Number of Ways to Arrive at Destination", en: "Number of Ways to Arrive at Destination" },
    titleVi: { vi: "Số cách đến đích trong thời gian ngắn nhất", en: "Count shortest ways to the destination" },
    statement: {
      vi: "Có n giao lộ đánh số 0..n-1 và các road vô hướng [u,v,time]. Hãy đếm số cách đi từ 0 tới n-1 trong thời gian ngắn nhất, trả kết quả modulo 10^9+7. Nhập road dạng 'u,v,time', ngăn cách bằng dấu ';'.",
      en: "There are n intersections numbered 0..n-1 and undirected roads [u,v,time]. Count the ways to travel from 0 to n-1 in the shortest time, modulo 10^9+7. Enter roads as 'u,v,time' separated by ';'.",
    },
    defaultInput: "0,6,7;0,1,2;1,2,3;1,3,3;6,3,3;3,5,1;6,5,1;2,5,1;0,4,5;4,6,2",
    inputKind: "string",
    inputLabel: { vi: "roads (u,v,time; ...)", en: "roads (u,v,time; ...)" },
    extraParams: [
      { key: "n", label: { vi: "n (số giao lộ)", en: "n (intersections)" }, default: 7, min: 1, max: 30 },
    ],
    approach: [
      { vi: "Xây adjacency list hai chiều vì mỗi road là vô hướng.", en: "Build a bidirectional adjacency list because every road is undirected." },
      { vi: "Chạy Dijkstra từ node 0. dist[x] lưu thời gian nhỏ nhất; ways[x] lưu số đường đạt đúng dist[x].", en: "Run Dijkstra from node 0. dist[x] stores the shortest time; ways[x] counts routes attaining exactly dist[x]." },
      { vi: "Nếu new_time < dist[v], tìm được mốc ngắn hơn: thay dist[v] và gán ways[v] = ways[u].", en: "If new_time < dist[v], a shorter time was found: replace dist[v] and set ways[v] = ways[u]." },
      { vi: "Nếu new_time == dist[v], tìm thêm các đường cùng ngắn nhất: ways[v] = (ways[v] + ways[u]) % MOD; không push heap vì dist không đổi.", en: "If new_time == dist[v], more equally short routes were found: ways[v] = (ways[v] + ways[u]) % MOD; do not push because dist is unchanged." },
      { vi: "Bỏ qua heap entry khi time > dist[u]. Sau khi heap rỗng, trả ways[n-1].", en: "Skip a heap entry when time > dist[u]. After the heap empties, return ways[n-1]." },
    ],
    complexity: {
      time: "O((V + E) log V)",
      space: "O(V + E)",
      note: {
        vi: "Adjacency list chứa 2E hướng. Mỗi lần dist giảm sẽ push heap; mảng dist, ways và predecessor dùng O(V+E) bộ nhớ trong visualization.",
        en: "The adjacency list stores 2E directions. Each distance improvement pushes the heap; dist, ways, and visualization predecessors use O(V+E) space.",
      },
    },
    code: [
      "import heapq",
      "from typing import List",
      "",
      "class Solution:",
      "    def countPaths(self, n: int, roads: List[List[int]]) -> int:",
      "        MOD = 10**9 + 7",
      "        graph = [[] for _ in range(n)]",
      "        for u, v, travel_time in roads:",
      "            graph[u].append((v, travel_time))",
      "            graph[v].append((u, travel_time))",
      "",
      "        dist = [float('inf')] * n",
      "        ways = [0] * n",
      "        dist[0] = 0",
      "        ways[0] = 1",
      "        heap = [(0, 0)]  # time, node",
      "",
      "        while heap:",
      "            time, u = heapq.heappop(heap)",
      "            if time > dist[u]:",
      "                continue",
      "            for v, travel_time in graph[u]:",
      "                new_time = time + travel_time",
      "                if new_time < dist[v]:",
      "                    dist[v] = new_time",
      "                    ways[v] = ways[u]",
      "                    heapq.heappush(heap, (new_time, v))",
      "                elif new_time == dist[v]:",
      "                    ways[v] = (ways[v] + ways[u]) % MOD",
      "        return ways[n - 1]",
    ],
    builder: buildSteps1976,
  },
  3977: {
    id: 3977,
    difficulty: "hard",
    slug: "minimum-time-to-reach-target-with-limited-power",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Minimum Time to Reach Target With Limited Power", en: "Minimum Time to Reach Target With Limited Power" },
    titleVi: { vi: "Thời gian ngắn nhất để đến đích với nguồn điện giới hạn", en: "Shortest time with limited power" },
    statement: {
      vi:
        "Cho đồ thị có hướng gồm n node 0..n-1. Mỗi cạnh [u,v,t] cần t giây để đi qua. " +
        "Muốn rời node u qua bất kỳ cạnh nào, tín hiệu phải còn ít nhất cost[u] điện và sẽ tiêu thụ đúng cost[u] điện. " +
        "Từ source với lượng điện ban đầu power, hãy tìm thời gian nhỏ nhất để đến target; nếu có nhiều đường cùng thời gian, chọn đường còn nhiều điện nhất. Không thể đến thì trả về [-1,-1].",
      en:
        "Given a directed graph with nodes 0..n-1, each edge [u,v,t] takes t seconds. " +
        "Leaving node u along any edge requires and consumes cost[u] power. Starting at source with initial power, " +
        "return [minimum time to target, maximum remaining power among minimum-time paths], or [-1,-1] if unreachable.",
    },
    defaultInput: "0,1,1;1,4,1;0,2,1;2,3,1;3,4,1",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (u,v,time; cách nhau bởi dấu ;)", en: "Edges (u,v,time; semicolon separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số node)", en: "n (number of nodes)" }, default: 5, min: 1, max: 1000 },
      { key: "power", label: { vi: "Điện ban đầu", en: "Initial power" }, default: 4, min: 1, max: 1000 },
      { key: "cost", type: "string", label: { vi: "cost của từng node", en: "Cost for each node" }, default: "2,3,1,1,1" },
      { key: "source", label: { vi: "Node nguồn", en: "Source node" }, default: 0, min: 0 },
      { key: "target", label: { vi: "Node đích", en: "Target node" }, default: 4, min: 0 },
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Dijkstra + trạng thái", en: "Approach 1: State Dijkstra" } },
          { value: "2", label: { vi: "Cách 2: DP theo tầng điện", en: "Approach 2: Power-layer DP" } },
        ],
      },
    ],
    approach: [
      {
        vi: "Cả hai cách đều dùng trạng thái (node, remaining_power), vì cùng node nhưng lượng điện khác nhau có khả năng đi tiếp khác nhau.",
        en: "Both approaches use state (node, remaining_power), because different power at the same node changes future feasibility.",
      },
      {
        vi: "Cách 1 chạy Dijkstra trên đồ thị trạng thái; heap ưu tiên thời gian nhỏ nhất rồi điện còn lại lớn nhất.",
        en: "Approach 1 runs Dijkstra on the state graph; the heap prefers minimum time, then maximum remaining power.",
      },
      {
        vi: "Cách 2 nhận ra mỗi cạnh luôn làm giảm điện vì cost[u] ≥ 1; do đó đồ thị trạng thái là DAG theo tầng điện.",
        en: "Approach 2 observes that every edge decreases power because cost[u] ≥ 1, making the state graph a DAG by power layer.",
      },
      {
        vi: "Quét remaining_power từ cao xuống thấp và relax sang tầng thấp hơn, sau đó chọn thời gian nhỏ nhất tại target; hòa thời gian thì giữ power lớn hơn.",
        en: "Scan remaining power from high to low, relax into lower layers, then choose the minimum target time and greatest power on a tie.",
      },
    ],
    complexity: {
      time: "O((n·P + E·P) log(n·P)) / O((n+E)·P)",
      space: "O(n·P + E)",
      note: {
        vi: "Cách 1 có thêm log(n·P) do heap. Cách 2 xử lý DAG theo tầng điện nên không cần priority queue.",
        en: "Approach 1 pays an extra log(n·P) heap factor. Approach 2 processes the layered DAG without a priority queue.",
      },
    },
    code: [
      "import heapq",
      "from collections import defaultdict",
      "",
      "class Solution:",
      "    def minTimeMaxPower(self, n, edges, power, cost, source, target):",
      "        graph = defaultdict(list)",
      "        for u, v, travel_time in edges:",
      "            graph[u].append((v, travel_time))",
      "        INF = float('inf')",
      "        dist = [[INF] * (power + 1) for _ in range(n)]",
      "        dist[source][power] = 0",
      "        heap = [(0, -power, source)]",
      "        while heap:",
      "            time, neg_power, u = heapq.heappop(heap)",
      "            remaining = -neg_power",
      "            if time != dist[u][remaining]: continue",
      "            if u == target: return [time, remaining]",
      "            if remaining < cost[u]: continue",
      "            next_power = remaining - cost[u]",
      "            for v, travel_time in graph[u]:",
      "                next_time = time + travel_time",
      "                if next_time < dist[v][next_power]:",
      "                    dist[v][next_power] = next_time",
      "                    heapq.heappush(heap, (next_time, -next_power, v))",
      "        return [-1, -1]",
    ],
    code2: [
      "from collections import defaultdict",
      "class Solution:",
      "    def minTimeMaxPowerDP(self, n, edges, power, cost, source, target):",
      "        graph = defaultdict(list)",
      "        for u, v, travel_time in edges:",
      "            graph[u].append((v, travel_time))",
      "        INF = float('inf')",
      "        dp = [[INF] * (power + 1) for _ in range(n)]",
      "        dp[source][power] = 0",
      "        for remaining in range(power, -1, -1):",
      "            for u in range(n):",
      "                time = dp[u][remaining]",
      "                if time == INF: continue",
      "                if remaining < cost[u]: continue",
      "                next_power = remaining - cost[u]",
      "                for v, travel_time in graph[u]:",
      "                    next_time = time + travel_time",
      "                    if next_time < dp[v][next_power]:",
      "                        dp[v][next_power] = next_time",
      "        best_time = INF",
      "        best_power = -1",
      "        for remaining in range(power, -1, -1):",
      "            if dp[target][remaining] < best_time:",
      "                best_time, best_power = dp[target][remaining], remaining",
      "        return [best_time, best_power] if best_power >= 0 else [-1, -1]",
    ],
    codeLabel: { vi: "Cách 1: Dijkstra + trạng thái", en: "Approach 1: State Dijkstra" },
    code2Label: { vi: "Cách 2: DP theo tầng điện", en: "Approach 2: Power-layer DP" },
    builder: buildSteps3977,
  },
  3620: {
    id: 3620,
    difficulty: "hard",
    slug: "network-recovery-pathways",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Network Recovery Pathways", en: "Network Recovery Pathways" },
    titleVi: { vi: "Đường phục hồi mạng", en: "Network recovery pathways" },
    statement: {
      vi:
        "Cho DAG có n node 0..n-1, cạnh có hướng [u, v, cost], mảng online cho biết node nào đang online, " +
        "và giới hạn tổng cost k. Một path 0→n-1 hợp lệ nếu mọi node trung gian online và tổng cost <= k. " +
        "Score của path là cost nhỏ nhất trong các cạnh trên path. Trả về score lớn nhất trong mọi path hợp lệ, hoặc -1.",
      en:
        "Given a DAG with n nodes 0..n-1, directed edges [u, v, cost], an online array, and total cost limit k. " +
        "A 0→n-1 path is valid if every intermediate node is online and total cost <= k. " +
        "The path score is the minimum edge cost on that path. Return the maximum valid path score, or -1.",
    },
    defaultInput: "0-1-7,1-4-5,0-2-6,2-3-6,3-4-2,2-4-6",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (u-v-cost, cách bởi dấu phẩy)", en: "Edges (u-v-cost, comma separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số node)", en: "n (number of nodes)" }, default: 5 },
      { key: "online", type: "string", label: { vi: "online (true/false)", en: "online (true/false)" }, default: "true,true,true,false,true" },
      { key: "k", label: { vi: "k (giới hạn tổng cost)", en: "k (total cost limit)" }, default: 12 },
    ],
    approach: [
      {
        vi: "Score của path là min edge cost, nên đáp án nằm trong các cost cạnh.",
        en: "A path score is the minimum edge cost, so the answer is one of the edge costs.",
      },
      {
        vi: "Binary search score X: chỉ giữ cạnh có cost >= X và bỏ node offline.",
        en: "Binary search score X: keep only edges with cost >= X and remove offline nodes.",
      },
      {
        vi: "Vì graph là DAG, kiểm tra X bằng DP shortest path theo topological order: dist[v] = tổng cost nhỏ nhất từ 0 tới v.",
        en: "Because the graph is a DAG, check X with shortest-path DP in topological order: dist[v] = cheapest total cost from 0 to v.",
      },
      {
        vi: "Nếu dist[n-1] <= k thì X hợp lệ, thử tăng X; ngược lại giảm X.",
        en: "If dist[n-1] <= k, X is feasible and we try higher; otherwise try lower.",
      },
    ],
    complexity: {
      time: "O((V + E) log E)",
      space: "O(V + E)",
      note: {
        vi: "Mỗi lần check duyệt topo + cạnh một lần: O(V+E). Binary search trên các cost cạnh khác nhau. Bộ nhớ cho adjacency, topo, dist.",
        en: "Each check scans the topological order and edges once: O(V+E). Binary search over distinct edge costs. Memory for adjacency, topo, and dist.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def findMaxPathScore(self, edges, online, k):",
      "        n = len(online)",
      "        graph = [[] for _ in range(n)]",
      "        indeg = [0] * n",
      "        for u, v, c in edges:",
      "            graph[u].append((v, c))",
      "            indeg[v] += 1",
      "        q = deque([i for i in range(n) if indeg[i] == 0])",
      "        topo = []",
      "        while q:",
      "            u = q.popleft()",
      "            topo.append(u)",
      "            for v, _ in graph[u]:",
      "                indeg[v] -= 1",
      "                if indeg[v] == 0:",
      "                    q.append(v)",
      "",
      "        def feasible(score):",
      "            INF = 10**30",
      "            dist = [INF] * n",
      "            dist[0] = 0",
      "            for u in topo:",
      "                if dist[u] == INF or not online[u]:",
      "                    continue",
      "                for v, c in graph[u]:",
      "                    if c >= score and online[v]:",
      "                        dist[v] = min(dist[v], dist[u] + c)",
      "            return dist[n - 1] <= k",
      "",
      "        vals = sorted(set(c for _, _, c in edges))",
      "        ans, lo, hi = -1, 0, len(vals) - 1",
      "        while lo <= hi:",
      "            mid = (lo + hi) // 2",
      "            if feasible(vals[mid]):",
      "                ans = vals[mid]",
      "                lo = mid + 1",
      "            else:",
      "                hi = mid - 1",
      "        return ans",
    ],
    builder: buildSteps3620,
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
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: DFS + memoization (reversed graph)", en: "Approach 1: DFS + memoization (reversed graph)" } },
          { value: "2", label: { vi: "Cách 2: BFS Kahn (topological sort)", en: "Approach 2: BFS Kahn (topological sort)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 (DFS): đảo chiều đồ thị (b→a), DFS từ từng nút. Khi answer[node] != -1 → đã tính → trả luôn (memoization).", en: "Approach 1 (DFS): reverse the graph (b→a), DFS from each node. If answer[node] != -1 → already computed → return (memoization)." },
      { vi: "Cách 2 (BFS Kahn): giữ đồ thị gốc (a→b), tính indegree. Nút indegree=0 vào queue. Khi lấy u, truyền answer[u] xuống mọi v mà u giàu hơn; giảm indegree[v], nếu = 0 thì enqueue.", en: "Approach 2 (BFS Kahn): keep the original graph (a→b), compute indegree. Nodes with indegree=0 enter the queue. When dequeuing u, propagate answer[u] to every v poorer than u; decrement indegree[v] and enqueue when it hits 0." },
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V + E)",
      note: {
        vi: "Cả hai cách đều O(V+E). DFS: mỗi nút tính 1 lần nhờ memo. BFS: mỗi nút/cạnh xử lý đúng 1 lần.",
        en: "Both are O(V+E). DFS: each node computed once via memo. BFS: each node/edge processed exactly once.",
      },
    },
    codeLabel: { vi: "Cách 1: DFS + memoization", en: "Approach 1: DFS + memoization" },
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
    code2Label: { vi: "Cách 2: BFS Kahn (topological sort)", en: "Approach 2: BFS Kahn (topological sort)" },
    code2: [
      "class Solution:",
      "    def loudAndRich(self, richer, quiet):",
      "        n = len(quiet)",
      "        graph = defaultdict(list)  # a -> [b] (a richer than b)",
      "        indegree = [0] * n",
      "        for a, b in richer:",
      "            graph[a].append(b)",
      "            indegree[b] += 1",
      "        answer = list(range(n))",
      "        q = collections.deque()",
      "        for i in range(n):",
      "            if indegree[i] == 0:",
      "                q.append(i)",
      "        while q:",
      "            u = q.popleft()",
      "            for v in graph[u]:",
      "                if quiet[answer[u]] < quiet[answer[v]]:",
      "                    answer[v] = answer[u]",
      "                indegree[v] -= 1",
      "                if indegree[v] == 0:",
      "                    q.append(v)",
      "        return answer",
    ],
    builder: buildSteps851,
    builder2: buildSteps851v2,
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
      "class Solution:",
      "    def minimumSemesters(self, n: int, relations: List[List[int]]) -> int:",
      "        \"\"\"",
      "        topo by layer",
      "        \"\"\"",
      "        graph = defaultdict(list)",
      "",
      "        indegree = [0 for _ in range(n)]",
      "",
      "        for u, v in relations:",
      "            graph[u-1].append(v-1)",
      "            indegree[v-1] += 1",
      "",
      "        queue = deque()",
      "",
      "        for i in range(n):",
      "            if indegree[i] == 0:",
      "                queue.append(i)",
      "",
      "        semester = 0",
      "        count = 0",
      "        while queue:",
      "            size = len(queue)",
      "            for _ in range(size):",
      "                curr = queue.popleft()",
      "                count += 1",
      "",
      "                for nei in graph[curr]:",
      "                    indegree[nei] -= 1",
      "                    if indegree[nei] == 0:",
      "                        queue.append(nei)",
      "",
      "            semester += 1",
      "",
      "        if count == n:",
      "            return semester",
      "        else:",
      "            return -1",
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
  1926: {
    id: 1926,
    difficulty: "medium",
    slug: "nearest-exit-from-entrance-in-maze",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Nearest Exit from Entrance in Maze", en: "Nearest Exit from Entrance in Maze" },
    titleVi: { vi: "Lối ra gần nhất trong mê cung", en: "Nearest exit in a maze" },
    statement: {
      vi: "Cho mê cung dạng lưới gồm '.' là ô trống và '+' là tường. Bạn bắt đầu tại entrance. Hãy tìm số bước ít nhất để đi tới một ô biên bất kỳ khác entrance. Nếu không có lối ra, trả về -1.",
      en: "Given a maze grid where '.' is an empty cell and '+' is a wall. Start from entrance. Find the minimum number of steps to reach any border cell other than the entrance. Return -1 if no exit exists.",
    },
    defaultInput: ".+.+|....|+...|....",
    inputKind: "string",
    inputLabel: { vi: "Mê cung (hàng cách bởi |, ô cách bởi ,)", en: "Maze (rows separated by |, cells by ,)" },
    extraParams: [
      { key: "entranceRow", label: { vi: "entranceRow", en: "entranceRow" }, default: 1 },
      { key: "entranceCol", label: { vi: "entranceCol", en: "entranceCol" }, default: 1 },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Mỗi ô được thăm tối đa 1 lần trong BFS, nên thời gian O(m·n). Cần visited và queue kích thước O(m·n).",
        en: "Each cell is visited at most once by BFS, so time is O(m·n). visited and queue take O(m·n) space.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def nearestExit(self, maze, entrance):",
      "        m, n = len(maze), len(maze[0])",
      "        q = deque([(entrance[0], entrance[1], 0)])",
      "        seen = {tuple(entrance)}",
      "        while q:",
      "            r, c, d = q.popleft()",
      "            if [r, c] != entrance and (r == 0 or c == 0 or r == m - 1 or c == n - 1):",
      "                return d",
      "            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < m and 0 <= nc < n and maze[nr][nc] == '.' and (nr, nc) not in seen:",
      "                    seen.add((nr, nc))",
      "                    q.append((nr, nc, d + 1))",
      "        return -1",
    ],
    builder: buildSteps1926,
  },
  207: {
    id: 207,
    difficulty: "medium",
    slug: "course-schedule",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Course Schedule", en: "Course Schedule" },
    titleVi: { vi: "Lịch học (kiểm tra chu trình)", en: "Can finish all courses?" },
    statement: {
      vi:
        "Có numCourses môn học (đánh số 0..numCourses-1) và mảng prerequisites, trong đó [a, b] nghĩa là PHẢI HỌC b TRƯỚC a. " +
        "Trả về true nếu có thể hoàn thành tất cả môn học (đồ thị không có chu trình), false nếu không. " +
        "Nhập tiên quyết: cặp a-b cách bởi dấu phẩy (vd: 1-0,2-1).",
      en:
        "There are numCourses courses (0..numCourses-1) and an array prerequisites where [a, b] means b must be taken before a. " +
        "Return true if you can finish all courses (no cycle), false otherwise. " +
        "Enter prerequisites as a-b pairs separated by comma (e.g. 1-0,2-1).",
    },
    defaultInput: "1-0,2-1,3-2",
    inputKind: "string",
    inputLabel: { vi: "Tiên quyết (a-b = học b trước a)", en: "Prerequisites (a-b = b before a)" },
    extraParams: [
      { key: "numCourses", label: { vi: "numCourses (số môn)", en: "numCourses" }, default: 4 },
    ],
    approach: [
      { vi: "Đây là bài topological sort cổ điển — kiểm tra đồ thị có chu trình không.", en: "Classic topological sort — detect whether the graph has a cycle." },
      { vi: "Mỗi [a, b] tạo cạnh b → a (b là tiên quyết của a). Đếm in-degree mỗi nút.", en: "Each [a, b] creates edge b → a (b is prereq of a). Count in-degree for each node." },
      { vi: "Kahn's algorithm: lặp đi lặp lại, lấy mọi nút có in-degree = 0, giảm in-degree các nút phụ thuộc.", en: "Kahn's algorithm: repeatedly take all nodes with in-degree = 0, decrement dependents." },
      { vi: "Nếu cuối cùng học hết tất cả → không chu trình → true. Nếu kẹt lại (còn nút mà in-degree > 0) → có chu trình → false.", en: "If all nodes are processed → no cycle → true. If stuck (nodes remain with in-degree > 0) → cycle → false." },
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V + E)",
      note: {
        vi: "Mỗi nút duyệt 1 lần, mỗi cạnh giảm in-degree 1 lần. Bộ nhớ cho adjacency list + in-degree array + queue.",
        en: "Each node visited once, each edge decremented once. Memory for adjacency list + in-degree array + queue.",
      },
    },
    code: [
      "from collections import defaultdict, deque",
      "",
      "class Solution:",
      "    def canFinish(self, numCourses, prerequisites):",
      "        adj = defaultdict(list)",
      "        in_deg = [0] * numCourses",
      "        for a, b in prerequisites:",
      "            adj[b].append(a)",
      "            in_deg[a] += 1",
      "        queue = deque([i for i in range(numCourses) if in_deg[i] == 0])",
      "        taken = 0",
      "        while queue:",
      "            u = queue.popleft()",
      "            taken += 1",
      "            for v in adj[u]:",
      "                in_deg[v] -= 1",
      "                if in_deg[v] == 0:",
      "                    queue.append(v)",
      "        return taken == numCourses",
    ],
    builder: buildSteps207,
  },
  210: {
    id: 210,
    difficulty: "medium",
    slug: "course-schedule-ii",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Course Schedule II", en: "Course Schedule II" },
    titleVi: { vi: "Lịch học II (topological sort)", en: "Course schedule II (topological sort)" },
    statement: {
      vi: "Cho numCourses môn và các cặp prereq. Trả về MỘT thứ tự học hợp lệ (hoặc [] nếu có chu trình). Nhập cặp dạng course-prereq, cách nhau dấu phẩy; n trong tham số.",
      en: "Given numCourses and prerequisite pairs, return ONE valid order (or [] if a cycle exists). Enter pairs as course-prereq comma-separated; n as a parameter.",
    },
    defaultInput: "1-0,2-0,3-1,3-2",
    inputKind: "string",
    inputLabel: { vi: "Cặp course-prereq (cách bởi ,)", en: "course-prereq pairs (comma separated)" },
    extraParams: [
      { key: "n", label: { vi: "numCourses", en: "numCourses" }, default: 4 },
    ],
    approach: [
      { vi: "Cạnh prereq → course. indegree[c] = số môn phải học trước c.", en: "Edge prereq → course. indegree[c] = number of prerequisites of c." },
      { vi: "Kahn: đưa mọi môn indegree=0 vào queue.", en: "Kahn: enqueue all courses with indegree=0." },
      { vi: "Pop dần, thêm vào order, giảm indegree hàng xóm; indegree=0 → enqueue.", en: "Pop repeatedly, append to order, decrement neighbors; indegree=0 → enqueue." },
      { vi: "Nếu order thiếu môn → có chu trình → [].", en: "If order misses courses → a cycle exists → []." },
    ],
    complexity: { time: "O(V+E)", space: "O(V+E)", note: { vi: "Mỗi đỉnh và cạnh xử lý 1 lần.", en: "Each vertex and edge processed once." } },
    code: [
      "from collections import defaultdict, deque",
      "class Solution:",
      "    def findOrder(self, numCourses, prerequisites):",
      "        graph = defaultdict(list); indegree = [0]*numCourses",
      "        for course, prereq in prerequisites: graph[prereq].append(course); indegree[course]+=1",
      "        queue = deque([c for c in range(numCourses) if indegree[c]==0])",
      "        order = []",
      "        while queue:",
      "            course = queue.popleft(); order.append(course)",
      "            for nxt in graph[course]:",
      "                indegree[nxt]-=1",
      "                if indegree[nxt]==0: queue.append(nxt)",
      "        return order if len(order)==numCourses else []",
    ],
    builder: buildSteps210,
  },
  399: {
    id: 399,
    difficulty: "medium",
    slug: "evaluate-division",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Evaluate Division", en: "Evaluate Division" },
    titleVi: { vi: "Tính phép chia (đồ thị có trọng số)", en: "Evaluate division (weighted graph)" },
    statement: {
      vi: "Cho các phương trình a/b = giá trị và các truy vấn. Tính kết quả mỗi truy vấn (hoặc -1 nếu không xác định). Nhập equations dạng a/b cách nhau dấu phẩy; values, queries trong tham số.",
      en: "Given equations a/b = value and queries, evaluate each query (or -1 if undetermined). Enter equations as a/b comma-separated; values, queries as parameters.",
    },
    defaultInput: "a/b,b/c",
    inputKind: "string",
    inputLabel: { vi: "equations (a/b, cách bởi ,)", en: "equations (a/b, comma separated)" },
    extraParams: [
      { key: "values", label: { vi: "values (cách bởi ,)", en: "values (comma separated)" }, default: "2,3" },
      { key: "queries", label: { vi: "queries (a/b, cách bởi ,)", en: "queries (a/b, comma separated)" }, default: "a/c,b/a,a/e,x/x" },
    ],
    approach: [
      { vi: "Xây đồ thị có hướng có trọng số: a→b = a/b, b→a = 1/(a/b).", en: "Build a weighted directed graph: a→b = a/b, b→a = 1/(a/b)." },
      { vi: "Mỗi query a/b: DFS từ a tới b, nhân trọng số các cạnh trên đường đi.", en: "Each query a/b: DFS from a to b, multiply edge weights along the path." },
      { vi: "Nếu a hoặc b không có trong đồ thị, hoặc không có đường đi → -1.", en: "If a or b is missing, or no path exists → -1." },
    ],
    complexity: { time: "O(Q·(V+E))", space: "O(V+E)", note: { vi: "Q truy vấn, mỗi lần DFS O(V+E).", en: "Q queries, each DFS is O(V+E)." } },
    code: [
      "class Solution:",
      "    def calcEquation(self, equations, values, queries):",
      "        graph = defaultdict(dict)",
      "        for (a,b),v in zip(equations, values): graph[a][b]=v; graph[b][a]=1/v",
      "        def dfs(src, dst, visited):",
      "            if src not in graph or dst not in graph: return -1.0",
      "            if src == dst: return 1.0",
      "            visited.add(src)",
      "            for nei, w in graph[src].items():",
      "                if nei not in visited:",
      "                    r = dfs(nei, dst, visited)",
      "                    if r != -1.0: return w * r",
      "            return -1.0",
      "        return [dfs(a, b, set()) for a, b in queries]",
    ],
    builder: buildSteps399,
  },
  847: {
    id: 847,
    difficulty: "hard",
    slug: "shortest-path-visiting-all-nodes",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Shortest Path Visiting All Nodes", en: "Shortest Path Visiting All Nodes" },
    titleVi: { vi: "Đường ngắn nhất thăm mọi nút", en: "Shortest path covering all nodes" },
    statement: {
      vi:
        "Cho đồ thị vô hướng liên thông có n nút (0..n-1), graph[i] là danh sách kề của nút i. " +
        "Trả về độ dài đường đi ngắn nhất thăm TẤT CẢ nút. Có thể bắt đầu/kết thúc ở bất kỳ nút nào, được thăm lại nút/cạnh. " +
        "Nhập: mỗi hàng cách bởi '|', các nút kề cách bởi ','. Ví dụ: '1,2,3|0|0|0'.",
      en:
        "Given a connected undirected graph with n nodes (0..n-1), graph[i] is the adjacency list of node i. " +
        "Return the length of the shortest path that visits EVERY node. May start/end anywhere; nodes/edges may be revisited. " +
        "Input: rows separated by '|', neighbors by ','. E.g. '1,2,3|0|0|0'.",
    },
    defaultInput: "1,2,3|0|0|0",
    inputKind: "string",
    inputLabel: { vi: "Adjacency list (hàng cách '|')", en: "Adjacency list (rows separated by '|')" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "BFS state-space (node, mask)", en: "BFS state-space (node, mask)" } },
          { value: 2, label: { vi: "DP Bitmask + Floyd-Warshall", en: "DP Bitmask + Floyd-Warshall" } },
        ],
      },
    ],
    approach: [
      { vi: "Đây là bài Shortest Path nhưng state KHÔNG chỉ là nút — phải nhớ đã thăm những nút nào.", en: "Shortest path, but state is NOT just the node — must track which nodes have been visited." },
      { vi: "Dùng bitmask: visited_mask có n bit, bit i = 1 nghĩa là đã thăm nút i.", en: "Use a bitmask: visited_mask has n bits; bit i = 1 means node i has been visited." },
      { vi: "State BFS = (node, mask). Mục tiêu: đạt state có mask == (1 << n) - 1 (tất cả bit 1).", en: "BFS state = (node, mask). Goal: reach a state where mask == (1 << n) - 1 (all bits set)." },
      { vi: "Vì bắt đầu ở đâu cũng được → khởi tạo queue với MỌI nút: (i, 1<<i, 0) cho i = 0..n-1.", en: "Any node can be the start → initialize queue with EVERY node: (i, 1<<i, 0) for i = 0..n-1." },
      { vi: "Mỗi level BFS = 1 bước đi. Khi pop state có mask = fullMask → trả về dist hiện tại.", en: "Each BFS level = 1 step. When popping a state with mask = fullMask → return the current dist." },
    ],
    complexity: {
      time: "O(n² · 2ⁿ)",
      space: "O(n · 2ⁿ)",
      note: {
        vi: "Có n·2ⁿ state (node, mask). Mỗi state thử tối đa n hàng xóm. Bộ nhớ visited set + queue.",
        en: "There are n·2ⁿ (node, mask) states. Each tries up to n neighbors. Memory for visited set + queue.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def shortestPathLength(self, graph):",
      "        n = len(graph)",
      "        if n == 1: return 0",
      "        full = (1 << n) - 1",
      "        visited = {(i, 1 << i) for i in range(n)}",
      "        queue = deque([(i, 1 << i, 0) for i in range(n)])",
      "        while queue:",
      "            node, mask, dist = queue.popleft()",
      "            for nxt in graph[node]:",
      "                new_mask = mask | (1 << nxt)",
      "                if new_mask == full:",
      "                    return dist + 1",
      "                if (nxt, new_mask) in visited:",
      "                    continue",
      "                visited.add((nxt, new_mask))",
      "                queue.append((nxt, new_mask, dist + 1))",
      "        return -1",
    ],
    code2: [
      "# Bitmask DP + Floyd-Warshall (TSP-like)",
      "class Solution:",
      "    def shortestPathLength(self, graph):",
      "        n = len(graph)",
      "        if n == 1: return 0",
      "        INF = float('inf')",
      "        # Step 1: Floyd-Warshall — dist[i][j] = shortest path i→j",
      "        dist = [[INF]*n for _ in range(n)]",
      "        for i in range(n):",
      "            dist[i][i] = 0",
      "            for j in graph[i]: dist[i][j] = 1",
      "        for k in range(n):",
      "            for i in range(n):",
      "                for j in range(n):",
      "                    if dist[i][k] + dist[k][j] < dist[i][j]:",
      "                        dist[i][j] = dist[i][k] + dist[k][j]",
      "        # Step 2: TSP DP — dp[mask][i] = min path visiting mask, ending at i",
      "        full = (1 << n) - 1",
      "        dp = [[INF]*n for _ in range(1 << n)]",
      "        for i in range(n): dp[1 << i][i] = 0",
      "        for mask in range(1 << n):",
      "            for i in range(n):",
      "                if dp[mask][i] == INF: continue",
      "                for j in range(n):",
      "                    if mask & (1 << j): continue",
      "                    nm = mask | (1 << j)",
      "                    if dp[mask][i] + dist[i][j] < dp[nm][j]:",
      "                        dp[nm][j] = dp[mask][i] + dist[i][j]",
      "        return min(dp[full])",
    ],
    codeLabel: { vi: "Cách 1: BFS state-space", en: "Approach 1: BFS state-space" },
    code2Label: { vi: "Cách 2: DP Bitmask + Floyd-Warshall", en: "Approach 2: DP Bitmask + Floyd-Warshall" },
    builder: buildSteps847,
  },
  1319: {
    id: 1319,
    difficulty: "medium",
    slug: "number-of-operations-to-make-network-connected",
    category: { key: "dfs", vi: "DFS", en: "DFS" },
    title: { vi: "Number of Operations to Make Network Connected", en: "Number of Operations to Make Network Connected" },
    titleVi: { vi: "Số thao tác để nối mạng (DFS)", en: "Operations to connect all computers (DFS)" },
    statement: {
      vi: "Có n máy tính (0..n-1) và connections là các cáp mạng. Mỗi thao tác: tháo 1 cáp và cắm lại nơi khác. Tìm số thao tác ít nhất để tất cả máy tính liên thông. Không được thì trả -1. Nhập cạnh: 'a,b' cách bởi ';'.",
      en: "There are n computers (0..n-1) and connections are cables. One operation: remove a cable and plug it elsewhere. Find the minimum operations to connect all computers. Return -1 if impossible. Enter edges as 'a,b' separated by ';'.",
    },
    defaultInput: "0,1;0,2;1,2",
    inputKind: "string",
    inputLabel: { vi: "connections (a,b;a,b...)", en: "connections (a,b;a,b...)" },
    extraParams: [
      { key: "n", label: { vi: "n (số máy tính)", en: "n (computers)" }, default: 4 },
    ],
    approach: [
      { vi: "Nếu số cáp < n-1 → trả -1 ngay (không đủ cáp để nối n máy tính).", en: "If edges < n-1 → return -1 immediately (never enough cables)." },
      { vi: "DFS từ mỗi nút chưa thăm để đếm số connected components.", en: "DFS from each unvisited node to count connected components." },
      { vi: "Cần components-1 thao tác để nối tất cả các nhóm lại. Luôn có đủ cáp dư vì edges ≥ n-1.", en: "Need components-1 operations to connect all groups. Always have spare cables since edges ≥ n-1." },
    ],
    complexity: {
      time: "O(n + E)",
      space: "O(n + E)",
      note: {
        vi: "Xây adjacency list O(E). DFS thăm mỗi nút/cạnh đúng 1 lần O(n+E).",
        en: "Build adjacency list O(E). DFS visits each node/edge once O(n+E).",
      },
    },
    code: [
      "from collections import defaultdict",
      "",
      "class Solution:",
      "    def makeConnected(self, n, connections):",
      "        if len(connections) < n - 1:",
      "            return -1",
      "        graph = defaultdict(list)",
      "        for a, b in connections:",
      "            graph[a].append(b)",
      "            graph[b].append(a)",
      "        visited = set()",
      "        def dfs(node):",
      "            stack = [node]",
      "            while stack:",
      "                cur = stack.pop()",
      "                for nb in graph[cur]:",
      "                    if nb not in visited:",
      "                        visited.add(nb)",
      "                        stack.append(nb)",
      "        components = 0",
      "        for i in range(n):",
      "            if i not in visited:",
      "                visited.add(i)",
      "                dfs(i)",
      "                components += 1",
      "        return components - 1",
    ],
    builder: buildSteps1319DFS,
  },
  2492: {
    id: 2492,
    difficulty: "medium",
    slug: "minimum-score-of-a-path-between-two-cities",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Minimum Score of a Path Between Two Cities", en: "Minimum Score of a Path Between Two Cities" },
    titleVi: { vi: "Điểm nhỏ nhất của đường đi (Union-Find)", en: "Minimum path score (Union-Find)" },
    statement: {
      vi:
        "Cho n thành phố và các cạnh có trọng số (distance). Điểm của một đường đi = cạnh có trọng số NHỎ NHẤT trên đường đó. " +
        "Trả về điểm nhỏ nhất có thể của một đường đi từ thành phố 1 đến thành phố n (có thể đi qua lại, không cần đường đơn giản).",
      en:
        "Given n cities and weighted edges (roads). The score of a path is the MINIMUM weight edge on that path. " +
        "Return the minimum possible score of any path from city 1 to city n (revisiting nodes/edges is allowed).",
    },
    defaultInput: "1,2,9;2,3,6;2,4,5;1,4,7",
    inputKind: "string",
    inputLabel: { vi: "edges (a,b,dist; ngăn bởi ;)", en: "edges (a,b,dist; semicolon separated)" },
    extraParams: [{ key: "n", label: { vi: "n (số thành phố)", en: "n (cities)" }, default: 4 }],
    complexity: {
      time: "O(m α(n))",
      space: "O(n)",
      note: {
        vi: "Union-Find: mỗi cạnh union gần O(1). Duyệt lại các cạnh để lấy min trong component chứa 1 và n cũng O(m).",
        en: "Union-Find: each union is near O(1). Re-scanning edges for the min within city 1/n's component is also O(m).",
      },
    },
    code: [
      "class Solution:",
      "    def minScore(self, n, roads):",
      "        parent = list(range(n + 1))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        def union(a, b):",
      "            ra, rb = find(a), find(b)",
      "            if ra != rb: parent[ra] = rb",
      "        for a, b, d in roads:",
      "            union(a, b)",
      "        root = find(1)",
      "        ans = float('inf')",
      "        for a, b, d in roads:",
      "            if find(a) == root:",
      "                ans = min(ans, d)",
      "        return ans",
    ],
    builder: buildSteps2492,
  },
  ...multiSourceBfsProblems,
  ...floodFillProblems,
  1245: {
    id: 1245,
    difficulty: "medium",
    slug: "tree-diameter",
    category: { key: "graph", vi: "Đồ thị / BFS", en: "Graph / BFS" },
    title: { vi: "Tree Diameter", en: "Tree Diameter" },
    titleVi: { vi: "Đường kính cây (double BFS)", en: "Tree diameter (double BFS)" },
    statement: {
      vi: "Cho cây không trọng số n node với n-1 cạnh. Đường kính là số cạnh của đường đi dài nhất giữa 2 node bất kỳ. Nhập edges: mỗi cạnh 'u,v' cách nhau ';'.",
      en: "Given an unweighted tree with n nodes and n-1 edges. The diameter is the number of edges on the longest path between any two nodes. Enter edges: each 'u,v' pair separated by ';'.",
    },
    defaultInput: "0,1;0,2",
    inputKind: "string",
    inputLabel: { vi: "edges (u,v cách nhau ;)", en: "edges (u,v pairs separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "BFS từ MỘT node bất kỳ (ví dụ node 0) → tìm node xa nhất A.", en: "BFS from ANY node (e.g. node 0) → find the farthest node A." },
      { vi: "Tính chất cây: A luôn là một đầu mút của đường kính.", en: "Tree property: A is always one endpoint of the diameter." },
      { vi: "BFS lần 2 từ A → tìm node xa nhất B và khoảng cách = đường kính.", en: "Second BFS from A → find the farthest node B; that distance is the diameter." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "2 lần BFS, mỗi lần O(n) trên cây có n-1 cạnh.",
        en: "Two BFS passes, each O(n) on a tree with n-1 edges.",
      },
    },
    code: [
      "from collections import defaultdict, deque",
      "class Solution:",
      "    def treeDiameter(self, edges):",
      "        if not edges: return 0",
      "        graph = defaultdict(list)",
      "        for u, v in edges:",
      "            graph[u].append(v); graph[v].append(u)",
      "        def bfs(start):",
      "            visited = {start}",
      "            queue = deque([(start, 0)])",
      "            far_node, far_dist = start, 0",
      "            while queue:",
      "                node, dist = queue.popleft()",
      "                if dist > far_dist: far_node, far_dist = node, dist",
      "                for nei in graph[node]:",
      "                    if nei not in visited:",
      "                        visited.add(nei)",
      "                        queue.append((nei, dist + 1))",
      "            return far_node, far_dist",
      "        a, _ = bfs(0)",
      "        _, diameter = bfs(a)",
      "        return diameter",
    ],
    builder: buildSteps1245,
  },
  4003: {
    id: 4003,
    difficulty: "hard",
    slug: "minimum-cost-path-with-alternating-directions-iii",
    category: { key: "graph", vi: "Đồ thị / Dijkstra", en: "Graph / Dijkstra" },
    title: { vi: "Minimum Cost Path with Alternating Directions III", en: "Minimum Cost Path with Alternating Directions III" },
    titleVi: { vi: "Đường đi chi phí tối thiểu với hướng xen kẽ III", en: "Min-cost path with alternating direction parity" },
    statement: {
      vi:
        "Lưới m×n. Chi phí vào ô (i,j) = (i+1)×(j+1). Mỗi hành động có parity (lẻ/chẵn): " +
        "đi đúng hướng (lẻ→phải/xuống, chẵn→trái/lên) không bị phạt; " +
        "đi sai hướng hoặc đứng chờ → cộng penalty[r][c]. Tìm chi phí tối thiểu từ (0,0) đến (m-1,n-1). " +
        "Nhập penalty (hàng cách ';', giá trị cách ',').",
      en:
        "m×n grid. Entry cost of (i,j) = (i+1)×(j+1). Each action has a parity (odd/even): " +
        "moving in the matching direction (odd→right/down, even→left/up) costs nothing extra; " +
        "violating the parity or waiting adds penalty[r][c]. Find the minimum total cost from (0,0) to (m-1,n-1). " +
        "Enter the penalty matrix (rows separated by ';', values by ',').",
    },
    defaultInput: "3,2;1,4",
    inputKind: "string",
    inputLabel: { vi: "penalty (hàng cách ';')", en: "penalty (rows separated by ';')" },
    extraParams: [],
    approach: [
      { vi: "State = (r, c, parity): vị trí hiện tại và parity của hành động kế tiếp.", en: "State = (r, c, parity): current position and parity of the next action." },
      { vi: "Dijkstra với min-heap trên state. Chi phí bắt đầu = entry(0,0), parity = 1 (lẻ).", en: "Dijkstra with a min-heap on states. Start cost = entry(0,0), parity = 1 (odd)." },
      { vi: "Di chuyển đúng parity → chỉ trả entry cost đích. Sai parity → cộng penalty[r][c].", en: "Move following parity → only pay destination entry cost. Violate → add penalty[r][c]." },
      { vi: "Đứng chờ → trả penalty[r][c], parity đổi.", en: "Wait → pay penalty[r][c], parity flips." },
    ],
    complexity: {
      time: "O(m × n × log(m × n))",
      space: "O(m × n)",
      note: {
        vi: "2 trạng thái parity mỗi ô → O(mn) nút; heap O(mn log mn).",
        en: "2 parity states per cell → O(mn) nodes; heap O(mn log mn).",
      },
    },
    code: [
      "import heapq",
      "class Solution:",
      "    def minCost(self, m, n, penalty):",
      "        INF = float('inf')",
      "        dist = [[[INF]*2 for _ in range(n)] for _ in range(m)]",
      "        dist[0][0][1] = (0+1)*(0+1)",
      "        heap = [(dist[0][0][1], 0, 0, 1)]",
      "        while heap:",
      "            cost, r, c, par = heapq.heappop(heap)",
      "            if cost > dist[r][c][par]: continue",
      "            if r == m-1 and c == n-1: return cost",
      "            for dr, dc in [(0,1),(1,0),(0,-1),(-1,0)]:",
      "                nr, nc = r+dr, c+dc",
      "                if 0 <= nr < m and 0 <= nc < n:",
      "                    follows = (par==1 and dr+dc>0) or (par==0 and dr+dc<0)",
      "                    pen = 0 if follows else penalty[r][c]",
      "                    nc_cost = cost + (nr+1)*(nc+1) + pen",
      "                    if nc_cost < dist[nr][nc][1-par]:",
      "                        dist[nr][nc][1-par] = nc_cost",
      "                        heapq.heappush(heap,(nc_cost,nr,nc,1-par))",
      "            wait_cost = cost + penalty[r][c]",
      "            if wait_cost < dist[r][c][1-par]:",
      "                dist[r][c][1-par] = wait_cost",
      "                heapq.heappush(heap,(wait_cost,r,c,1-par))",
      "        return min(dist[m-1][n-1])",
    ],
    builder: buildSteps4003,
  },
  3310: {
    id: 3310,
    difficulty: "medium",
    slug: "remove-methods-from-project",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Remove Methods From Project", en: "Remove Methods From Project" },
    titleVi: { vi: "Xóa method suspicious khỏi dự án", en: "Remove suspicious methods from project" },
    statement: {
      vi:
        "Cho n methods (0..n-1), danh sách cạnh có hướng (method a gọi method b), và method k bị lỗi. " +
        "Mọi method mà k gọi được (trực tiếp/gián tiếp) đều là suspicious. " +
        "Nếu KHÔNG có method nào bên ngoài nhóm suspicious gọi VÀO nhóm → xóa nhóm suspicious, trả phần còn lại. " +
        "Ngược lại → trả tất cả n methods. Nhập cạnh dạng 'a-b' (a gọi b), cách bởi dấu phẩy.",
      en:
        "Given n methods (0..n-1), a directed invocation list (method a calls method b), and a known buggy method k. " +
        "Every method reachable from k is suspicious. " +
        "If NO method outside the suspicious group calls INTO it → remove the group, return the rest. " +
        "Otherwise → return all n methods. Enter edges as 'a-b' (a calls b), comma separated.",
    },
    defaultInput: "1-2,0-1,3-2",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (a-b = a gọi b, cách bởi dấu phẩy)", en: "Edges (a-b = a calls b, comma separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số methods)", en: "n (number of methods)" }, default: 4 },
      { key: "k", label: { vi: "k (method bị lỗi)", en: "k (buggy method)" }, default: 1 },
    ],
    approach: [
      { vi: "BFS/DFS từ k để tìm tập suspicious (tất cả method mà k gọi được trực/gián tiếp).", en: "BFS/DFS from k to find the suspicious set (all methods reachable from k, directly or transitively)." },
      { vi: "Kiểm tra: có cạnh (u,v) nào mà u ∉ suspicious và v ∈ suspicious? Nếu có → không thể xóa (method bên ngoài phụ thuộc vào nhóm này).", en: "Check: any edge (u,v) where u ∉ suspicious and v ∈ suspicious? If so → cannot remove (an outside method depends on the group)." },
      { vi: "Nếu không có cạnh chặn → xóa nhóm, trả các method còn lại. Ngược lại → trả tất cả.", en: "If no blocking edge → remove the group, return remaining methods. Otherwise → return all." },
    ],
    complexity: {
      time: "O(n + e)",
      space: "O(n + e)",
      note: {
        vi: "BFS O(n+e) + duyệt edges O(e).",
        en: "BFS O(n+e) + scan edges O(e).",
      },
    },
    code: [
      "class Solution:",
      "    def remainingMethods(self, n, k, invocations):",
      "        adj = [[] for _ in range(n)]",
      "        for a, b in invocations:",
      "            adj[a].append(b)",
      "        suspicious = set()",
      "        queue = deque([k])",
      "        suspicious.add(k)",
      "        while queue:",
      "            node = queue.popleft()",
      "            for nxt in adj[node]:",
      "                if nxt not in suspicious:",
      "                    suspicious.add(nxt)",
      "                    queue.append(nxt)",
      "        for a, b in invocations:",
      "            if a not in suspicious and b in suspicious:",
      "                return list(range(n))",
      "        return [i for i in range(n) if i not in suspicious]",
    ],
    builder: buildSteps3310,
  },
};

Object.defineProperty(module.exports, "__buildSteps1631Dijkstra", {
  value: buildSteps1631,
});

Object.defineProperty(module.exports, "__buildSteps695v2", {
  value: buildSteps695v2,
});
