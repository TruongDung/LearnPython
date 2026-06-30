/**
 * Graph / BFS builder functions for LeetCode Visualizer.
 * Problems: 1293, 1368, 1377, 126, 815
 */

// ─── 1293: Shortest Path in Grid with Obstacles Elimination ───
function buildSteps1293(input, params) {
  const rows = params.rows || 3;
  const cols = params.cols || 4;
  const k = params.k != null ? params.k : 1;
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(input.slice(r * cols, (r + 1) * cols));
  }
  const original = grid.map(row => [...row]);
  const steps = [];
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  // 3D visited: visited[r][c][elim]
  const visited = Array.from({length: rows}, () =>
    Array.from({length: cols}, () => new Array(k + 1).fill(false))
  );

  // BFS queue: [row, col, remainingK, dist]
  let queue = [[0, 0, k, 0]];
  visited[0][0][k] = true;
  let answer = -1;

  // Helper to build bfsGrid cells snapshot
  function snapshot(levelCells, frontierCells, pathCells) {
    const cells = Array.from({length: rows}, (_, r) =>
      Array.from({length: cols}, (_, c) => {
        if (pathCells && pathCells.has(`${r},${c}`)) return {cls: "path", label: ""};
        if (frontierCells && frontierCells.has(`${r},${c}`)) return {cls: "queued", label: ""};
        if (levelCells && levelCells.has(`${r},${c}`)) return {cls: "visited", label: ""};
        if (grid[r][c] === 1) return {cls: "wall", label: "■"};
        return {cls: "empty", label: ""};
      })
    );
    cells[0][0] = {...cells[0][0], cls: cells[0][0].cls === "path" ? "path" : "start", label: "S"};
    if (rows > 0 && cols > 0) {
      const er = rows - 1, ec = cols - 1;
      if (cells[er][ec].cls !== "path") cells[er][ec] = {cls: "end", label: "E"};
      else cells[er][ec].label = "E";
    }
    return cells;
  }

  const allVisitedCells = new Set();
  allVisitedCells.add("0,0");

  // Initial step
  steps.push({
    title: {vi: "Khởi tạo BFS", en: "Initialize BFS"},
    arr: [], highlight: [], mark: [], codeLines: [],
    bfsGrid: {cells: snapshot(allVisitedCells, new Set(["0,0"]), null), rows, cols},
    vars: [{name: "k", value: k}, {name: "queue", value: "[(0,0)]"}, {name: "dist", value: 0}],
    note: {vi: `Bắt đầu BFS từ (0,0), được phép phá tối đa k=${k} vật cản.`,
           en: `Start BFS from (0,0), allowed to eliminate up to k=${k} obstacles.`}
  });

  let found = false;
  let level = 0;
  while (queue.length > 0 && !found && steps.length < 20) {
    const nextQueue = [];
    const frontierSet = new Set();
    for (const [r, c, rem, dist] of queue) {
      if (r === rows - 1 && c === cols - 1) { answer = dist; found = true; break; }
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const newK = grid[nr][nc] === 1 ? rem - 1 : rem;
        if (newK < 0) continue;
        if (visited[nr][nc][newK]) continue;
        visited[nr][nc][newK] = true;
        allVisitedCells.add(`${nr},${nc}`);
        frontierSet.add(`${nr},${nc}`);
        nextQueue.push([nr, nc, newK, dist + 1]);
      }
    }
    if (found) break;
    level++;
    queue = nextQueue;
    if (queue.length > 0) {
      steps.push({
        title: {vi: `BFS level ${level}`, en: `BFS level ${level}`},
        arr: [], highlight: [], mark: [], codeLines: [],
        bfsGrid: {cells: snapshot(allVisitedCells, frontierSet, null), rows, cols},
        vars: [{name: "level", value: level}, {name: "frontier", value: queue.length}, {name: "k_left", value: "varies"}],
        note: {vi: `Mở rộng ${queue.length} ô ở khoảng cách ${level}.`,
               en: `Expanded ${queue.length} cells at distance ${level}.`}
      });
    }
    // Check if target reached in next level
    for (const [r, c, , dist] of queue) {
      if (r === rows - 1 && c === cols - 1) { answer = dist; found = true; break; }
    }
  }

  // Final step
  steps.push({
    title: {vi: "Kết quả", en: "Result"},
    arr: [], highlight: [], mark: [], codeLines: [],
    bfsGrid: {cells: snapshot(allVisitedCells, null, found ? allVisitedCells : null), rows, cols},
    vars: [{name: "answer", value: answer}],
    note: {vi: answer >= 0 ? `Đường đi ngắn nhất = ${answer} bước.` : "Không tìm được đường đi.",
           en: answer >= 0 ? `Shortest path = ${answer} steps.` : "No valid path found."}
  });

  return {original, answer, steps};
}

// ─── 1368: Minimum Cost Valid Path in Grid ───
function buildSteps1368(input, params) {
  // Parse input: can be a string "1,1,3|3,2,2|1,1,4" or flat array with rows/cols params
  let grid;
  if (typeof input === "string") {
    grid = input.split("|").map(row => row.split(",").map(Number));
  } else {
    const rows = params.rows || 3;
    const cols = params.cols || Math.ceil(input.length / rows);
    grid = [];
    for (let r = 0; r < rows; r++) grid.push(input.slice(r * cols, (r + 1) * cols));
  }
  const rows = grid.length;
  const cols = grid[0].length;
  const original = grid.map(row => [...row]);
  const steps = [];
  const arrowMap = {1: "→", 2: "←", 3: "↓", 4: "↑"};
  const dirMap = {1: [0,1], 2: [0,-1], 3: [1,0], 4: [-1,0]};
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  // 0-1 BFS using deque
  const dist = Array.from({length: rows}, () => new Array(cols).fill(Infinity));
  dist[0][0] = 0;
  const deque = [[0, 0]]; // [row, col]

  function snapshot(currentSet, costColors) {
    return Array.from({length: rows}, (_, r) =>
      Array.from({length: cols}, (_, c) => {
        const arrow = arrowMap[grid[r][c]] || "?";
        let cls = "empty";
        if (currentSet && currentSet.has(`${r},${c}`)) cls = "current";
        else if (dist[r][c] < Infinity) {
          cls = dist[r][c] === 0 ? "start" : "visited";
        }
        return {cls, label: arrow};
      })
    );
  }

  steps.push({
    title: {vi: "Khởi tạo 0-1 BFS", en: "Initialize 0-1 BFS"},
    arr: [], highlight: [], mark: [], codeLines: [],
    bfsGrid: {cells: snapshot(new Set(["0,0"]), null), rows, cols},
    vars: [{name: "start", value: "(0,0)"}, {name: "cost", value: 0}],
    note: {vi: "Đi theo mũi tên: chi phí 0. Đổi hướng: chi phí 1. Dùng 0-1 BFS (deque).",
           en: "Following arrow: cost 0. Changing direction: cost 1. Using 0-1 BFS (deque)."}
  });

  let maxCostSeen = 0;
  while (deque.length > 0) {
    const [r, c] = deque.shift();
    if (dist[r][c] > maxCostSeen) {
      maxCostSeen = dist[r][c];
      if (steps.length < 18) {
        const frontier = new Set();
        for (const [fr, fc] of deque) frontier.add(`${fr},${fc}`);
        steps.push({
          title: {vi: `Xử lý cost = ${maxCostSeen}`, en: `Processing cost = ${maxCostSeen}`},
          arr: [], highlight: [], mark: [], codeLines: [],
          bfsGrid: {cells: snapshot(frontier, null), rows, cols},
          vars: [{name: "cost_level", value: maxCostSeen}, {name: "deque_size", value: deque.length}],
          note: {vi: `Đang xử lý các ô có chi phí ${maxCostSeen}.`,
                 en: `Processing cells at cost level ${maxCostSeen}.`}
        });
      }
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const dirIdx = dirs.findIndex(d => d[0] === dr && d[1] === dc);
      const arrowDirs = [[0,1],[0,-1],[1,0],[-1,0]];
      const isArrow = grid[r][c] >= 1 && grid[r][c] <= 4 &&
        arrowDirs[grid[r][c]-1][0] === dr && arrowDirs[grid[r][c]-1][1] === dc;
      const w = isArrow ? 0 : 1;
      const newDist = dist[r][c] + w;
      if (newDist < dist[nr][nc]) {
        dist[nr][nc] = newDist;
        if (w === 0) deque.unshift([nr, nc]);
        else deque.push([nr, nc]);
      }
    }
  }

  const answer = dist[rows-1][cols-1] === Infinity ? -1 : dist[rows-1][cols-1];
  steps.push({
    title: {vi: "Kết quả", en: "Result"},
    arr: [], highlight: [], mark: [], codeLines: [],
    bfsGrid: {cells: Array.from({length: rows}, (_, r) =>
      Array.from({length: cols}, (_, c) => {
        const arrow = arrowMap[grid[r][c]] || "?";
        let cls = dist[r][c] === answer && (r === rows-1 && c === cols-1) ? "path" : "visited";
        if (r === 0 && c === 0) cls = "start";
        if (r === rows-1 && c === cols-1) cls = "path";
        return {cls, label: `${arrow}(${dist[r][c] === Infinity ? "∞" : dist[r][c]})`};
      })
    ), rows, cols},
    vars: [{name: "answer", value: answer}],
    note: {vi: `Chi phí tối thiểu đến (${rows-1},${cols-1}) = ${answer}.`,
           en: `Minimum cost to reach (${rows-1},${cols-1}) = ${answer}.`}
  });

  return {original, answer, steps};
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
function buildSteps126(input, params) {
  const beginWord = params.beginWord || "hit";
  const endWord = params.endWord || "cog";
  const wordList = input ? input.split(",").map(s => s.trim()) : ["hot","dot","dog","lot","log","cog"];
  const original = wordList.join(",");
  const steps = [];

  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) {
    steps.push({
      title: {vi: "endWord không trong danh sách", en: "endWord not in wordList"},
      arr: wordList.map(() => 0), highlight: [], mark: [], codeLines: [],
      vars: [{name: "endWord", value: endWord}],
      note: {vi: `"${endWord}" không có trong wordList → không có đường đi.`,
             en: `"${endWord}" is not in wordList → no path exists.`}
    });
    return {original, answer: [], steps};
  }

  // BFS level by level
  const level = {}; // word -> BFS level
  level[beginWord] = 0;
  let queue = [beginWord];
  const parents = {}; // word -> list of parent words
  let found = false;
  let lev = 0;

  const allWords = [beginWord, ...wordList];
  function neighbors(word) {
    const result = [];
    for (let i = 0; i < word.length; i++) {
      for (let ch = 97; ch <= 122; ch++) {
        const c = String.fromCharCode(ch);
        if (c === word[i]) continue;
        const nw = word.slice(0, i) + c + word.slice(i + 1);
        if (wordSet.has(nw) || nw === beginWord) result.push(nw);
      }
    }
    return result;
  }

  // Show initial state
  const barVals = wordList.map(() => 0);
  const labels = wordList.slice();
  steps.push({
    title: {vi: "Khởi tạo BFS", en: "Initialize BFS"},
    arr: [...barVals], sub: labels, highlight: [], mark: [], codeLines: [],
    vars: [{name: "beginWord", value: beginWord}, {name: "endWord", value: endWord}],
    note: {vi: `Tìm tất cả đường ngắn nhất từ "${beginWord}" đến "${endWord}".`,
           en: `Find all shortest paths from "${beginWord}" to "${endWord}".`}
  });

  while (queue.length > 0 && !found) {
    lev++;
    const nextQueue = [];
    const levelWords = new Set();
    for (const word of queue) {
      for (const nb of neighbors(word)) {
        if (nb === endWord) found = true;
        if (level[nb] == null) {
          level[nb] = lev;
          levelWords.add(nb);
          nextQueue.push(nb);
          parents[nb] = [word];
        } else if (level[nb] === lev) {
          parents[nb].push(word);
        }
      }
    }
    queue = nextQueue;

    // Update bar values to show level
    const hl = [];
    for (let i = 0; i < wordList.length; i++) {
      if (level[wordList[i]] != null) barVals[i] = level[wordList[i]];
      if (levelWords.has(wordList[i])) hl.push(i);
    }

    steps.push({
      title: {vi: `BFS level ${lev}`, en: `BFS level ${lev}`},
      arr: [...barVals], sub: labels, highlight: hl, mark: [], codeLines: [],
      vars: [{name: "level", value: lev}, {name: "new_words", value: [...levelWords].join(",")}],
      note: {vi: `Level ${lev}: khám phá [${[...levelWords].join(", ")}].${found ? " Tìm thấy endWord!" : ""}`,
             en: `Level ${lev}: discovered [${[...levelWords].join(", ")}].${found ? " Found endWord!" : ""}`}
    });
  }

  // DFS backtrack to find all paths
  const paths = [];
  function dfs(word, path) {
    if (word === beginWord) { paths.push([word, ...path]); return; }
    if (!parents[word]) return;
    for (const p of parents[word]) dfs(p, [word, ...path]);
  }
  if (found) dfs(endWord, []);

  const pathStrs = paths.map(p => p.join(" → "));
  steps.push({
    title: {vi: "Kết quả: tất cả đường ngắn nhất", en: "Result: all shortest paths"},
    arr: [...barVals], sub: labels, highlight: [], mark: [], codeLines: [],
    vars: [{name: "path_count", value: paths.length}, {name: "length", value: paths.length > 0 ? paths[0].length : 0}],
    note: {vi: paths.length > 0 ? `Tìm được ${paths.length} đường:\n${pathStrs.join("\n")}` : "Không có đường đi.",
           en: paths.length > 0 ? `Found ${paths.length} paths:\n${pathStrs.join("\n")}` : "No path exists."}
  });

  return {original, answer: paths, steps};
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

module.exports = { buildSteps1293, buildSteps1368, buildSteps1377, buildSteps126, buildSteps815 };
