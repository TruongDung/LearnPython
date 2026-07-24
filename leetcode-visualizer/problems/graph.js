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
    title: { vi: "Tạo adjacency list", en: "Create the adjacency list" },
    codeLine: 6,
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
    hlNodes: [k],
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: `Node nguồn k = ${k} nhận tín hiệu tại thời điểm 0.`,
      en: `Source node k = ${k} receives the signal at time 0.`,
    },
  });

  const heap = [[0, k]];
  pushStep({
    title: { vi: "Đưa nguồn vào min-heap", en: "Push the source into the min-heap" },
    codeLine: 11,
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

  function makeCells(current = null, pathCells = new Set()) {
    const queued = new Set(heap.map(([, r, c]) => key(r, c)));
    return heights.map((row, r) => row.map((height, c) => {
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
      return { label: String(height), meta: `e:${formatEffort(effort[r][c])}${endpoint}`, cls };
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
      codeBlock: 2,
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
      vi: "Mỗi ô là một node. Từ một ô có thể đi sang tối đa 4 node kề: dưới, trên, phải và trái.",
      en: "Each cell is a node. A cell can move to up to four adjacent nodes: down, up, right, and left.",
    },
  });

  pushStep({
    title: { vi: "Khởi tạo mọi effort bằng ∞", en: "Initialize every effort to ∞" },
    codeLine: 7,
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
    vars: [{ name: "heap", value: heapStr() }],
    note: {
      vi: "Heap lưu (effort, row, col) và luôn pop trạng thái có effort nhỏ nhất trước.",
      en: "The heap stores (effort, row, col) and always pops the smallest effort first.",
    },
  });

  pushStep({
    title: { vi: "Chuẩn bị 4 hướng di chuyển", en: "Prepare four movement directions" },
    codeLine: 10,
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
      const pathText = path.map(([pr, pc]) => `(${pr},${pc})`).join(" → ");
      pushStep({
        title: { vi: `Effort nhỏ nhất = ${answer}`, en: `Minimum effort = ${answer}` },
        codeLine: 17,
        pathCells,
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
        current: inBounds ? [nr, nc] : [r, c],
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
        current: [nr, nc],
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
        current: [nr, nc],
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
        current: [nr, nc],
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
        current: [nr, nc],
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
        current: [nr, nc],
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

module.exports = {
  // Category metadata: recommended display order for the Graph tag.
  // Picked up by problems/index.js and exposed to the catalog UI.
  __meta: {
    order: [200, 994, 1091, 1926, 207, 126, 127, 332, 743, 1514, 1631, 778, 1976, 787, 3977, 3620, 752, 815, 847, 851, 1136, 1197, 1236, 1293, 3286, 1368, 2290, 2577, 3341, 3342, 1377, 2492],
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

Object.defineProperty(module.exports, "__buildSteps1631Dijkstra", {
  value: buildSteps1631,
});
