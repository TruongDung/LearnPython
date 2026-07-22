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
    codeLines: [4, 5, 6],
    vars: [
      { name: "rows", value: rows },
      { name: "cols", value: cols },
      { name: "count", value: 0 },
    ],
    note: {
      vi: "Ta duyệt từng ô. Gặp đất '1' chưa thăm thì gọi dfs(i, j) để đánh dấu toàn bộ đảo trong visited.",
      en: "Scan every cell. An unvisited '1' triggers dfs(i, j), marking the whole island in visited.",
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
        codeLines: [5, 6, 7, 8],
        vars: [
          { name: "cell", value: `(${r}, ${c})` },
          { name: "count before dfs", value: islands - 1 },
          { name: "visited[i][j]", value: true },
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
          codeLines: [9, 10, 11, 12, 13, 14],
          vars: [
            { name: "current", value: `(${cr}, ${cc})` },
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
            codeLines: [15, 16, 17],
            vars: [
              { name: "from", value: `(${cr}, ${cc})` },
              { name: "neighbor", value: `(${nr}, ${nc})` },
              { name: "island", value: islands },
              { name: "visited[x][y]", value: true },
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
        codeLines: [23, 24],
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
    codeLines: [26],
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
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const shapeIdOf = Array.from({ length: rows }, () => Array(cols).fill(0)); // distinct shape id, 0 = none
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (r, c) => `${r},${c}`;

  function makeCells(current, buildingCells) {
    const bset = buildingCells ? new Set(buildingCells.map(([r, c]) => key(r, c))) : null;
    return grid.map((row, r) =>
      row.map((v, c) => {
        let cls, label;
        if (v === "0") { cls = "wall"; label = "0"; }
        else if (shapeIdOf[r][c] > 0) { cls = "visited"; label = String(shapeIdOf[r][c]); } // finished island: label = distinct shape #
        else { cls = "empty"; label = "1"; }
        if (bset && bset.has(key(r, c))) cls = "queued";
        if (current && current[0] === r && current[1] === c) cls = "current";
        return { label, cls };
      })
    );
  }

  function pushStep({ title, current = null, buildingCells = null, final = false, codeLines, vars, note }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells: makeCells(current, buildingCells) },
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

  const seen = new Set();
  let islandCount = 0;
  let distinctCount = 0;

  // Line 3: m, n = len(grid), len(grid[0])
  pushStep({
    title: { vi: "m, n = len(grid), len(grid[0])", en: "m, n = len(grid), len(grid[0])" },
    codeLines: [3],
    vars: [{ name: "m", value: rows }, { name: "n", value: cols }],
    note: { vi: `Kích thước lưới: m=${rows} hàng, n=${cols} cột.`, en: `Grid size: m=${rows} rows, n=${cols} cols.` },
  });

  // Line 4: seen = set()
  pushStep({
    title: { vi: "seen = set() (tập chữ ký)", en: "seen = set() (signature set)" },
    codeLines: [4],
    vars: [{ name: "seen", value: "{}" }],
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
      if (grid[r][c] !== "1" || visited[r][c]) continue;

      islandCount++;
      const r0 = r, c0 = c;

      // Step: found new land (line 16)
      pushStep({
        title: { vi: `Tìm thấy đất mới tại (${r},${c})`, en: `New land found at (${r},${c})` },
        current: [r, c],
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
        codeLines: [18],
        vars: [{ name: "origin", value: `(${r0}, ${c0})` }],
        note: {
          vi: `Bắt đầu DFS để lan khắp đảo và ghi hình dạng.`,
          en: `Start DFS to spread across the island and record its shape.`,
        },
      });

      // DFS traversal — one step per cell (line-by-line)
      const stack = [[r, c]];
      visited[r][c] = true;
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
          if (grid[nr][nc] !== "1" || visited[nr][nc]) continue;
          visited[nr][nc] = true;
          queuedNb.push([nr, nc]);
        }

        // Step: grid[r][c] = 0 — mark visited (line 8)
        pushStep({
          title: { vi: `dfs(${cr},${cc}): grid[${cr}][${cc}] = 0 (đánh dấu)`, en: `dfs(${cr},${cc}): grid[${cr}][${cc}] = 0 (mark visited)` },
          current: [cr, cc],
          buildingCells: buildingCells.slice(),
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
      const sig = shape
        .map(([a, b]) => `${a},${b}`)
        .sort()
        .join("|");
      const isNew = !seen.has(sig);
      if (isNew) {
        seen.add(sig);
        distinctCount++;
      }
      const thisShapeId = isNew ? distinctCount : [...seen].indexOf(sig) + 1;
      // Assign shape id for coloring the finished island cells
      for (const [cr, cc] of buildingCells) shapeIdOf[cr][cc] = thisShapeId;

      // Step: seen.add(tuple(shape)) (line 19)
      pushStep({
        title: {
          vi: isNew ? `Chữ ký MỚI → distinct = ${distinctCount}` : `Chữ ký TRÙNG (đã có) → không tăng`,
          en: isNew ? `NEW signature → distinct = ${distinctCount}` : `DUPLICATE signature → no increment`,
        },
        buildingCells: buildingCells.slice(),
        codeLines: [19],
        vars: [
          { name: "signature", value: `{${sig}}` },
          { name: "is new?", value: isNew },
          { name: "distinct count", value: distinctCount },
        ],
        note: {
          vi: isNew
            ? `Chữ ký {${sig}} chưa có trong seen → thêm vào. Số đảo khác hình = ${distinctCount}.`
            : `Chữ ký {${sig}} đã tồn tại trong seen → đảo này TRÙNG hình với đảo trước. Không tăng.`,
          en: isNew
            ? `Signature {${sig}} not in seen → add it. Distinct islands = ${distinctCount}.`
            : `Signature {${sig}} already in seen → this island is a DUPLICATE shape. No increment.`,
        },
      });
    }
  }

  // Final (line 20)
  steps.push({
    title: { vi: `Kết quả: ${distinctCount} đảo khác hình`, en: `Result: ${distinctCount} distinct islands` },
    arr: [],
    bfsGrid: { rows, cols, cells: makeCells(null, null) },
    highlight: [],
    mark: [],
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

module.exports = {
  // Category metadata: recommended display order for the Graph tag.
  // Picked up by problems/index.js and exposed to the catalog UI.
  __meta: {
    order: [200, 994, 1091, 1926, 207, 126, 127, 743, 3977, 3620, 752, 815, 847, 851, 1136, 1197, 1236, 1293, 3286, 1368, 1377, 2492],
    label: {
      vi: "Thứ tự học được khuyến nghị",
      en: "Recommended learning order",
    },
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
        "Cho grid m×n gồm '1' = đất và '0' = nước. Một đảo là nhóm các ô đất nối nhau theo 4 hướng " +
        "(trên, dưới, trái, phải), được bao quanh bởi nước hoặc biên grid. Hãy đếm số đảo. " +
        "Nhập grid: hàng cách bởi '|', có thể viết liền ký tự hoặc cách bằng dấu phẩy.",
      en:
        "Given an m×n grid of '1' land and '0' water. An island is a group of land cells connected in 4 directions " +
        "(up, down, left, right), surrounded by water or grid boundaries. Count the islands. " +
        "Enter rows separated by '|', either as compact characters or comma-separated values.",
    },
    defaultInput: "11110|11010|11000|00000",
    inputKind: "string",
    inputLabel: { vi: "Grid 0/1 (hàng cách '|')", en: "0/1 grid (rows separated by '|')" },
    approach: [
      { vi: "Duyệt từng ô trong grid. Nếu ô là nước hoặc đã thăm thì bỏ qua.", en: "Scan every cell. Skip water and already visited cells." },
      { vi: "Khi gặp đất chưa thăm, gọi dfs(i, j) để đánh dấu toàn bộ đảo trong mảng visited.", en: "When unvisited land is found, call dfs(i, j) to mark the whole island in visited." },
      { vi: "DFS thử 4 hướng; bỏ qua nếu ra ngoài biên hoặc gặp nước '0'.", en: "DFS tries 4 directions; skip out-of-bounds cells and water '0'." },
      { vi: "Sau khi dfs quay về, tăng count thêm 1 vì vừa xử lý xong một đảo.", en: "After dfs returns, increment count by 1 because one island has been fully processed." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Mỗi ô được thăm tối đa một lần. Bộ nhớ cho visited/stack trong trường hợp xấu nhất là O(m·n).",
        en: "Each cell is visited at most once. Visited/stack memory is O(m·n) in the worst case.",
      },
    },
    code: [
      "from typing import List",
      "",
      "class Solution:",
      "    def numIslands(self, grid: List[List[str]]) -> int:",
      "        m, n = len(grid), len(grid[0])",
      "        visited = [[False for j in range(n)] for i in range(m)]",
      "        directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]",
      "",
      "        def dfs(i, j):",
      "            visited[i][j] = True",
      "",
      "            for direction in directions:",
      "                x = i + direction[0]",
      "                y = j + direction[1]",
      "",
      "                if x < 0 or x >= m or y < 0 or y >= n or grid[x][y] == '0':",
      "                    continue",
      "                if not visited[x][y]:",
      "                    dfs(x, y)",
      "        ",
      "        count = 0",
      "        for i in range(m):",
      "            for j in range(n):",
      "                if grid[i][j] == '1':",
      "                    if not visited[i][j]:",
      "                        dfs(i, j)",
      "                        count += 1",
      "",
      "        return count",
    ],
    builder: buildSteps200,
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
      "        seen = set()",
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
      "                    seen.add(tuple(shape))",
      "        return len(seen)",
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
    approach: [
      { vi: "Duyệt từng ô. Nếu là nước hoặc đã thăm thì bỏ qua.", en: "Scan every cell. Skip water and already visited cells." },
      { vi: "Khi gặp đất chưa thăm, chạy DFS/BFS để gom toàn bộ đảo đó.", en: "When unvisited land is found, run DFS/BFS to collect that whole island." },
      { vi: "Mỗi ô đất pop ra khỏi stack làm area += 1.", en: "Each land cell popped from the stack increments area by 1." },
      { vi: "Sau mỗi đảo, cập nhật max_area = max(max_area, area).", en: "After each island, update max_area = max(max_area, area)." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Mỗi ô được thăm tối đa một lần. Stack/visited có thể lên tới O(m·n) trong trường hợp cả grid là đất.",
        en: "Each cell is visited at most once. Stack/visited can reach O(m·n) if the whole grid is land.",
      },
    },
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
    builder: buildSteps695,
  },
  994: {
    id: 994,
    difficulty: "medium",
    slug: "rotting-oranges",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Rotting Oranges", en: "Rotting Oranges" },
    titleVi: { vi: "Cam thối lan theo từng phút", en: "Minute-by-minute rotting BFS" },
    statement: {
      vi:
        "Cho grid m×n: 0 = ô trống, 1 = cam tươi, 2 = cam thối. Mỗi phút, cam thối làm thối các cam tươi kề 4 hướng. " +
        "Trả về số phút tối thiểu để không còn cam tươi, hoặc -1 nếu không thể. Nhập grid: hàng cách bởi '|', giá trị có thể cách bằng dấu phẩy hoặc viết liền.",
      en:
        "Given an m×n grid: 0 = empty, 1 = fresh orange, 2 = rotten orange. Each minute, rotten oranges rot adjacent fresh oranges in 4 directions. " +
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
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Mỗi ô được đưa vào queue tối đa một lần. Queue trong trường hợp xấu nhất chứa O(m·n) ô.",
        en: "Each cell enters the queue at most once. In the worst case, the queue stores O(m·n) cells.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def orangesRotting(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        q = deque()",
      "        fresh = 0",
      "        for r in range(m):",
      "            for c in range(n):",
      "                if grid[r][c] == 1:",
      "                    fresh += 1",
      "                elif grid[r][c] == 2:",
      "                    q.append((r, c))",
      "        if fresh == 0:",
      "            return 0",
      "        minutes = 0",
      "        dirs = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        while q and fresh > 0:",
      "            for _ in range(len(q)):",
      "                r, c = q.popleft()",
      "                for dr, dc in dirs:",
      "                    nr, nc = r + dr, c + dc",
      "                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:",
      "                        grid[nr][nc] = 2",
      "                        fresh -= 1",
      "                        q.append((nr, nc))",
      "            minutes += 1",
      "        return minutes if fresh == 0 else -1",
    ],
    builder: buildSteps994,
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
    titleVi: { vi: "Đường ngắn nhất phá vật cản (BFS 3D)", en: "BFS shortest path eliminating obstacles" },
    statement: {
      vi: "Cho lưới m×n (0=trống, 1=vật cản). Đi 4 hướng từ (0,0) đến (m-1,n-1). Được phá TỐI ĐA k vật cản. Tìm đường ngắn nhất (hoặc -1 nếu không thể). Nhập lưới: hàng cách '|', giá trị 0/1 cách ','.",
      en: "Given an m×n grid (0=empty, 1=obstacle). Move 4 directions from (0,0) to (m-1,n-1). May eliminate AT MOST k obstacles. Find the shortest path (or -1). Enter grid: rows separated by '|', values 0/1 by ','.",
    },
    defaultInput: "0,0,0|1,1,0|0,0,0|0,1,1|0,0,0",
    inputKind: "string",
    inputLabel: { vi: "Lưới (hàng cách '|')", en: "Grid (rows separated by '|')" },
    extraParams: [
      { key: "k", label: { vi: "k (phá tối đa bao nhiêu vật cản)", en: "k (max obstacles to eliminate)" }, default: 1 },
    ],
    approach: [
      { vi: "BFS nhưng state có 3 chiều: (row, col, k_còn_lại). Vì cùng ô nhưng k khác nhau → state khác nhau.", en: "BFS but state is 3D: (row, col, k_remaining). Same cell with different k → different states." },
      { vi: "Khi bước vào ô trống → k giữ nguyên. Bước vào ô vật cản → k giảm 1.", en: "Stepping into empty → k stays. Stepping into obstacle → k decreases by 1." },
      { vi: "Visited 3D: visited[r][c][k]. Chỉ skip nếu (r,c,k) đã thăm.", en: "3D visited: visited[r][c][k]. Only skip if (r,c,k) already visited." },
      { vi: "Khi tới (m-1,n-1) → trả dist hiện tại. BFS đảm bảo kết quả ngắn nhất.", en: "When reaching (m-1,n-1) → return current dist. BFS guarantees shortest." },
    ],
    complexity: { time: "O(m·n·k)", space: "O(m·n·k)", note: { vi: "Có m·n·k state. Mỗi state xét 4 hướng.", en: "m·n·k states. Each tries 4 directions." } },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def shortestPath(self, grid, k):",
      "        m, n = len(grid), len(grid[0])",
      "        vis = set()",
      "        vis.add((0, 0, k))",
      "        queue = deque([(0, 0, k, 0)])",
      "        while queue:",
      "            r, c, rem, d = queue.popleft()",
      "            if r == m-1 and c == n-1:",
      "                return d",
      "            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:",
      "                nr, nc = r+dr, c+dc",
      "                if 0<=nr<m and 0<=nc<n:",
      "                    nk = rem - grid[nr][nc]",
      "                    if nk >= 0 and (nr,nc,nk) not in vis:",
      "                        vis.add((nr, nc, nk))",
      "                        queue.append((nr, nc, nk, d+1))",
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
};
