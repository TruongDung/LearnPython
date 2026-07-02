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
 * Flood-fill every unvisited land component and keep the largest component size.
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
      codeLines: [4, 5],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Grid phải gồm 0/1. Ví dụ: 00100|01110|00100 hoặc 0,0,1,0,0|0,1,1,1,0.",
        en: "Grid must contain 0/1. Example: 00100|01110|00100 or 0,0,1,0,0|0,1,1,1,0.",
      },
    });
    return { original, answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const islandId = Array.from({ length: rows }, () => Array(cols).fill(0));
  const queued = new Set();
  const key = (r, c) => `${r},${c}`;

  function makeCells(current, bestCells = new Set()) {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        const cellKey = key(r, c);
        let cls = cell === "0" ? "wall" : "empty";
        let label = cell;
        if (visited[r][c]) {
          cls = "visited";
          label = String(islandId[r][c]);
        }
        if (bestCells.has(cellKey)) cls = "path";
        if (queued.has(cellKey)) cls = "queued";
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

  pushStep({
    title: { vi: "Quét grid và tìm đảo lớn nhất", en: "Scan grid and find the largest island" },
    codeLines: [4, 5, 6],
    vars: [
      { name: "rows", value: rows },
      { name: "cols", value: cols },
      { name: "max_area", value: 0 },
    ],
    note: {
      vi: "Tương tự Number of Islands, nhưng thay vì chỉ đếm đảo, ta đếm diện tích từng đảo và giữ diện tích lớn nhất.",
      en: "Like Number of Islands, but instead of only counting components, count each island area and keep the maximum.",
    },
  });

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let maxArea = 0;
  let island = 0;
  let bestCells = new Set();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1" || visited[r][c]) continue;

      island++;
      let area = 0;
      const cells = [];
      const stack = [[r, c]];
      visited[r][c] = true;
      islandId[r][c] = island;
      queued.add(key(r, c));

      pushStep({
        title: { vi: `Bắt đầu đảo #${island}`, en: `Start island #${island}` },
        current: [r, c],
        codeLines: [7, 8, 9, 10],
        vars: [
          { name: "start", value: `(${r}, ${c})` },
          { name: "area", value: area },
          { name: "max_area", value: maxArea },
        ],
        note: {
          vi: `Gặp đất chưa thăm tại (${r},${c}). Bắt đầu DFS để đo diện tích đảo #${island}.`,
          en: `Found unvisited land at (${r},${c}). Start DFS to measure island #${island}.`,
        },
      });

      while (stack.length) {
        const [cr, cc] = stack.pop();
        queued.delete(key(cr, cc));
        area++;
        cells.push(key(cr, cc));

        pushStep({
          title: { vi: `Đếm ô (${cr},${cc}) → area = ${area}`, en: `Count cell (${cr},${cc}) → area = ${area}` },
          current: [cr, cc],
          codeLines: [11, 12, 13],
          vars: [
            { name: "current", value: `(${cr}, ${cc})` },
            { name: "area", value: area },
            { name: "stack size", value: stack.length },
            { name: "max_area", value: maxArea },
          ],
          note: {
            vi: `Mỗi ô đất trong DFS đóng góp 1 vào diện tích. Đảo #${island} hiện có area = ${area}.`,
            en: `Each land cell reached by DFS contributes 1 to area. Island #${island} now has area = ${area}.`,
          },
        });

        for (const [dr, dc] of dirs) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (grid[nr][nc] !== "1" || visited[nr][nc]) continue;

          visited[nr][nc] = true;
          islandId[nr][nc] = island;
          stack.push([nr, nc]);
          queued.add(key(nr, nc));

          pushStep({
            title: { vi: `Thêm ô kề (${nr},${nc})`, en: `Add adjacent cell (${nr},${nc})` },
            current: [nr, nc],
            codeLines: [14, 15, 16, 17, 18],
            vars: [
              { name: "from", value: `(${cr}, ${cc})` },
              { name: "neighbor", value: `(${nr}, ${nc})` },
              { name: "area", value: area },
              { name: "stack size", value: stack.length },
            ],
            note: {
              vi: `(${nr},${nc}) là đất nối 4 hướng và chưa thăm, nên sẽ được tính vào cùng đảo #${island}.`,
              en: `(${nr},${nc}) is 4-directionally connected unvisited land, so it will count toward island #${island}.`,
            },
          });
        }
      }

      if (area > maxArea) {
        maxArea = area;
        bestCells = new Set(cells);
        pushStep({
          title: { vi: `Cập nhật max_area = ${maxArea}`, en: `Update max_area = ${maxArea}` },
          bestCells,
          codeLines: [19],
          vars: [
            { name: "island", value: island },
            { name: "area", value: area },
            { name: "max_area", value: maxArea },
          ],
          note: {
            vi: `Đảo #${island} có diện tích ${area}, lớn hơn kết quả cũ. Lưu lại làm đảo lớn nhất hiện tại.`,
            en: `Island #${island} has area ${area}, larger than the previous best. Save it as the current largest island.`,
          },
        });
      } else {
        pushStep({
          title: { vi: `Đảo #${island} có area = ${area}`, en: `Island #${island} has area = ${area}` },
          bestCells,
          codeLines: [19],
          vars: [
            { name: "island", value: island },
            { name: "area", value: area },
            { name: "max_area", value: maxArea },
          ],
          note: {
            vi: `Diện tích ${area} không vượt max_area hiện tại (${maxArea}), nên giữ nguyên đáp án.`,
            en: `Area ${area} does not exceed current max_area (${maxArea}), so the answer stays unchanged.`,
          },
        });
      }
    }
  }

  pushStep({
    title: { vi: `Kết quả: ${maxArea}`, en: `Result: ${maxArea}` },
    bestCells,
    final: true,
    codeLines: [20],
    vars: [
      { name: "answer", value: maxArea },
      { name: "islands scanned", value: island },
    ],
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

module.exports = {
  // Category metadata: recommended display order for the Graph tag.
  // Picked up by problems/index.js and exposed to the catalog UI.
  __meta: {
    order: [200, 695, 994, 207, 126, 127, 743, 752, 815, 847, 851, 1136, 1197, 1236, 1293, 3286, 1368, 1377],
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
  695: {
    id: 695,
    difficulty: "medium",
    slug: "max-area-of-island",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
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
};
