"use strict";

const bi = (vi, en) => ({ vi, en });
const DIRECTIONS = [
  [-1, 0, "↑", "up"],
  [0, 1, "→", "right"],
  [1, 0, "↓", "down"],
  [0, -1, "←", "left"],
];

const SOURCE = [
  "from functools import lru_cache",
  "",
  "class Solution:",
  "    def longestPhysicsPath(self, matrix):",
  "        rows, cols = len(matrix), len(matrix[0])",
  "        directions = [(-1, 0), (0, 1), (1, 0), (0, -1)]",
  "",
  "        @lru_cache(None)",
  "        def dfs(pos, moving, ceiling, mask):",
  "            r, c = divmod(pos, cols)",
  "            height = matrix[r][c]",
  "            best = (pos,)",
  "",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if not (0 <= nr < rows and 0 <= nc < cols):",
  "                    continue",
  "                nxt = nr * cols + nc",
  "                if mask & (1 << nxt):",
  "                    continue",
  "                next_height = matrix[nr][nc]",
  "",
  "                if not moving:",
  "                    if next_height > height:",
  "                        continue",
  "                    next_moving, next_ceiling = True, height",
  "                elif next_height <= height:",
  "                    next_moving, next_ceiling = True, height",
  "                elif next_height <= ceiling:",
  "                    next_moving, next_ceiling = False, -1",
  "                else:",
  "                    continue",
  "",
  "                suffix = dfs(nxt, next_moving, next_ceiling, mask | (1 << nxt))",
  "                candidate = (pos,) + suffix",
  "                if len(candidate) > len(best):",
  "                    best = candidate",
  "            return best",
  "",
  "        answer = ()",
  "        for pos in range(rows * cols):",
  "            candidate = dfs(pos, False, -1, 1 << pos)",
  "            if len(candidate) > len(answer):",
  "                answer = candidate",
  "        return len(answer)",
];

const SOURCE2 = [
  "class Solution:",
  "    def longestPhysicsPaths(self, matrix):",
  "        rows, cols = len(matrix), len(matrix[0])",
  "        directions = [(-1, 0), (0, 1), (1, 0), (0, -1)]",
  "        paths = []",
  "        path = []",
  "",
  "        def dfs(pos, moving, ceiling, mask):",
  "            r, c = divmod(pos, cols)",
  "            height = matrix[r][c]",
  "            path.append((r, c))",
  "            paths.append(path.copy())",
  "",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if not (0 <= nr < rows and 0 <= nc < cols):",
  "                    continue",
  "                nxt = nr * cols + nc",
  "                if mask & (1 << nxt):",
  "                    continue",
  "                next_height = matrix[nr][nc]",
  "",
  "                if not moving:",
  "                    if next_height > height:",
  "                        continue",
  "                    next_moving, next_ceiling = True, height",
  "                elif next_height <= height:",
  "                    next_moving, next_ceiling = True, height",
  "                elif next_height <= ceiling:",
  "                    next_moving, next_ceiling = False, -1",
  "                else:",
  "                    continue",
  "",
  "                dfs(nxt, next_moving, next_ceiling, mask | (1 << nxt))",
  "",
  "            path.pop()",
  "",
  "        for start in range(rows * cols):",
  "            dfs(start, False, -1, 1 << start)",
  "",
  "        longest = max(map(len, paths), default=0)",
  "        return longest, paths",
];

const SOURCE3 = [
  "from typing import List",
  "",
  "class Solution:",
  "    def longestPhysicsPath(self, matrix: List[List[int]]) -> int:",
  "        if not matrix or not matrix[0]:",
  "            return 0",
  "",
  "        rows, cols = len(matrix), len(matrix[0])",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "",
  "        visited = set()",
  "",
  "        def dfs(r, c, moving_down, ceiling):",
  "            visited.add((r, c))",
  "            best = 1",
  "            height = matrix[r][c]",
  "",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "",
  "                if not (0 <= nr < rows and 0 <= nc < cols):",
  "                    continue",
  "",
  "                if (nr, nc) in visited:",
  "                    continue",
  "",
  "                next_height = matrix[nr][nc]",
  "",
  "                if not moving_down:",
  "                    if next_height > height:",
  "                        continue",
  "",
  "                    next_down = True",
  "                    next_ceiling = height",
  "",
  "                elif next_height <= height:",
  "                    next_down = True",
  "                    next_ceiling = height",
  "",
  "                elif next_height <= ceiling:",
  "                    next_down = False",
  "                    next_ceiling = -1",
  "",
  "                else:",
  "                    continue",
  "",
  "                best = max(",
  "                    best,",
  "                    1 + dfs(nr, nc, next_down, next_ceiling)",
  "                )",
  "",
  "            visited.remove((r, c))",
  "            return best",
  "",
  "        answer = 0",
  "",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                answer = max(answer, dfs(r, c, False, -1))",
  "",
  "        return answer",
];

function parseMatrix(input) {
  let matrix = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new Error("9020 expects a non-empty matrix / Cần ma trận không rỗng.");
    if (text.startsWith("[")) {
      try {
        matrix = JSON.parse(text);
      } catch {
        throw new Error("9020: invalid JSON matrix / Ma trận JSON không hợp lệ.");
      }
    } else {
      matrix = text.split(/[;|]/).map((row) => row.split(",").map((value) => {
        if (!value.trim()) return Number.NaN;
        return Number(value.trim());
      }));
    }
  }
  const rectangular = Array.isArray(matrix)
    && matrix.length > 0
    && matrix.length <= 4
    && Array.isArray(matrix[0])
    && matrix[0].length > 0
    && matrix[0].length <= 4
    && matrix.length * matrix[0].length <= 12
    && matrix.every((row) => Array.isArray(row) && row.length === matrix[0].length);
  const validValues = rectangular && matrix.every((row) => row.every((value) => (
    Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000
  )));
  if (!validValues) {
    throw new Error("9020 expects a rectangular matrix with at most 12 cells (≤4×4), each integer in [0, 1e9].");
  }
  return matrix.map((row) => [...row]);
}

function solvePhysicsPath(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const memo = new Map();
  let states = 0;
  let cacheHits = 0;

  const dfs = (pos, moving, ceiling, mask) => {
    const key = `${pos}|${moving ? 1 : 0}|${ceiling}|${mask}`;
    if (memo.has(key)) {
      cacheHits += 1;
      return memo.get(key);
    }
    states += 1;
    const r = Math.floor(pos / cols);
    const c = pos % cols;
    const height = matrix[r][c];
    let best = [pos];

    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const next = nr * cols + nc;
      if ((mask & (1 << next)) !== 0) continue;
      const nextHeight = matrix[nr][nc];
      let nextMoving;
      let nextCeiling;
      if (!moving) {
        if (nextHeight > height) continue;
        nextMoving = true;
        nextCeiling = height;
      } else if (nextHeight <= height) {
        nextMoving = true;
        nextCeiling = height;
      } else if (nextHeight <= ceiling) {
        nextMoving = false;
        nextCeiling = -1;
      } else {
        continue;
      }
      const candidate = [pos, ...dfs(next, nextMoving, nextCeiling, mask | (1 << next))];
      if (candidate.length > best.length) best = candidate;
    }
    memo.set(key, best);
    return best;
  };

  let path = [];
  for (let pos = 0; pos < rows * cols; pos += 1) {
    const candidate = dfs(pos, false, -1, 1 << pos);
    if (candidate.length > path.length) path = candidate;
  }
  return { path, states, cacheHits };
}

function classifyMove(matrix, cols, from, to, mode, ceiling) {
  const [r, c] = from;
  const [nr, nc] = to;
  const height = matrix[r][c];
  const nextHeight = matrix[nr][nc];
  if (mode === "rest") {
    if (nextHeight <= height) return { allowed: true, rule: "launch", nextMode: "momentum", nextCeiling: height };
    return { allowed: false, rule: "too-high", nextMode: mode, nextCeiling: ceiling };
  }
  if (nextHeight <= height) return { allowed: true, rule: "coast", nextMode: "momentum", nextCeiling: height };
  if (nextHeight <= ceiling) return { allowed: true, rule: "spring", nextMode: "rest", nextCeiling: null };
  return { allowed: false, rule: "above-ceiling", nextMode: mode, nextCeiling: ceiling };
}

function buildReplayStates(matrix, path) {
  const cols = matrix[0].length;
  const states = [{ mode: "rest", ceiling: null }];
  const moves = [];
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = [Math.floor(path[index] / cols), path[index] % cols];
    const to = [Math.floor(path[index + 1] / cols), path[index + 1] % cols];
    const transition = classifyMove(matrix, cols, from, to, states[index].mode, states[index].ceiling);
    moves.push({ from, to, ...transition });
    states.push({ mode: transition.nextMode, ceiling: transition.nextCeiling });
  }
  return { states, moves };
}

function buildSteps(input) {
  const matrix = parseMatrix(input);
  const rows = matrix.length;
  const cols = matrix[0].length;
  const solved = solvePhysicsPath(matrix);
  const bestPath = solved.path.map((pos) => [Math.floor(pos / cols), pos % cols]);
  const replay = buildReplayStates(matrix, solved.path);
  const steps = [];

  const candidatesAt = (index) => {
    const [r, c] = bestPath[index];
    const state = replay.states[index];
    const visited = new Set(bestPath.slice(0, index + 1).map(([vr, vc]) => `${vr},${vc}`));
    return DIRECTIONS.map(([dr, dc, arrow, direction]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        return { direction, arrow, cell: [nr, nc], height: null, allowed: false, rule: "outside", visited: false };
      }
      const wasVisited = visited.has(`${nr},${nc}`);
      const classified = classifyMove(matrix, cols, [r, c], [nr, nc], state.mode, state.ceiling);
      return { direction, arrow, cell: [nr, nc], height: matrix[nr][nc], ...classified, allowed: !wasVisited && classified.allowed, visited: wasVisited };
    });
  };

  const emit = ({ line, phase, index = 0, next = null, title, note, final = false }) => {
    const current = bestPath[index] || null;
    const state = replay.states[index] || { mode: "rest", ceiling: null };
    const visitedPath = bestPath.slice(0, Math.min(index + 1, bestPath.length));
    const currentHeight = current ? matrix[current[0]][current[1]] : null;
    steps.push({
      arr: [],
      codeLines: [line],
      title,
      note,
      final,
      vars: [
        { name: "position", value: current ? `(${current[0]}, ${current[1]})` : "—" },
        { name: "height", value: currentHeight ?? "—" },
        { name: "mode", value: state.mode },
        { name: "ceiling", value: state.ceiling ?? "—" },
        { name: "visited", value: `${visitedPath.length}/${bestPath.length}` },
      ],
      springboardMatrix9020View: {
        problemId: 9020,
        method: 1,
        matrix: matrix.map((row) => [...row]),
        phase,
        current,
        next,
        currentHeight,
        mode: state.mode,
        ceiling: state.ceiling,
        path: visitedPath.map((cell) => [...cell]),
        bestPath: bestPath.map((cell) => [...cell]),
        moves: replay.moves.slice(0, Math.max(0, index)).map((move) => ({ ...move, from: [...move.from], to: [...move.to] })),
        nextMove: next ? { ...replay.moves[index], from: [...replay.moves[index].from], to: [...replay.moves[index].to] } : null,
        candidates: current ? candidatesAt(index) : [],
        answer: solved.path.length,
        statesExplored: solved.states,
        cacheHits: solved.cacheHits,
        line,
      },
    });
  };

  emit({
    line: 5,
    phase: "setup",
    title: bi(`Ma trận ${rows}×${cols}: ${rows * cols} cell`, `${rows}×${cols} matrix: ${rows * cols} cells`),
    note: bi("Mỗi cell được mã hóa bằng một bit để bảo đảm không ghé lại.", "Each cell is encoded by one bit so it cannot be visited twice."),
  });
  emit({
    line: 42,
    phase: "search",
    title: bi(`DFS + bitmask tìm được đường dài ${solved.path.length}`, `DFS + bitmask found a path of length ${solved.path.length}`),
    note: bi(`Đã xét ${solved.states} trạng thái chính xác. Bây giờ replay một đường tối ưu.`, `Exactly searched ${solved.states} states. Now replay one optimal path.`),
  });

  for (let index = 0; index < bestPath.length; index += 1) {
    const [r, c] = bestPath[index];
    const state = replay.states[index];
    emit({
      line: 9,
      phase: index === 0 ? "start" : "land",
      index,
      title: index === 0
        ? bi(`Bắt đầu tại (${r},${c}), cao ${matrix[r][c]}`, `Start at (${r},${c}), height ${matrix[r][c]}`)
        : bi(`Đáp tại (${r},${c}), cao ${matrix[r][c]}`, `Land at (${r},${c}), height ${matrix[r][c]}`),
      note: state.mode === "rest"
        ? bi("Đang đứng yên: bước kế tiếp bắt buộc phải đi xuống hoặc ngang độ cao.", "At rest: the next jump must go to an equal or lower height.")
        : bi(`Đang còn đà; trần bật hiện tại là ${state.ceiling}.`, `Momentum remains; the current spring ceiling is ${state.ceiling}.`),
    });
    emit({
      line: state.mode === "rest" ? 23 : 27,
      phase: "inspect",
      index,
      title: bi("Kiểm tra bốn cell kề", "Inspect the four adjacent cells"),
      note: bi("Cell đã đi qua bị loại trước; các cell còn lại được xét theo mode và trần đà.", "Visited cells are rejected first; remaining cells are checked against the mode and momentum ceiling."),
    });
    if (index < bestPath.length - 1) {
      const move = replay.moves[index];
      const labels = {
        launch: bi("nhảy xuống · bắt đầu có đà", "drop · gain momentum"),
        coast: bi("đi xuống · còn đà yếu hơn", "descend · weaker momentum"),
        spring: bi("bật lên · hết đà", "spring upward · momentum spent"),
      };
      emit({
        line: move.rule === "launch" ? 26 : move.rule === "coast" ? 28 : 30,
        phase: "move",
        index,
        next: bestPath[index + 1],
        title: bi(`Chọn (${move.to[0]},${move.to[1]}): ${labels[move.rule].vi}`, `Choose (${move.to[0]},${move.to[1]}): ${labels[move.rule].en}`),
        note: move.rule === "spring"
          ? bi(`Độ cao mới không vượt trần ${state.ceiling}; đáp xuống và đứng yên.`, `The new height does not exceed ceiling ${state.ceiling}; land and return to rest.`)
          : bi(`Trần đà kế tiếp hạ xuống còn ${matrix[r][c]}.`, `The next momentum ceiling drops to ${matrix[r][c]}.`),
      });
    }
  }

  emit({
    line: 45,
    phase: "done",
    index: bestPath.length - 1,
    title: bi(`Đường dài nhất có ${bestPath.length} cell`, `The longest path contains ${bestPath.length} cells`),
    note: bi("Mọi cell trên đường đều khác nhau và mỗi transition tuân thủ đúng trạng thái physics.", "Every cell on the path is unique and every transition obeys the physics state."),
    final: true,
  });

  return {
    original: matrix.map((row) => [...row]),
    answer: solved.path.length,
    path: bestPath.map((cell) => [...cell]),
    statesExplored: solved.states,
    cacheHits: solved.cacheHits,
    steps,
  };
}

function buildSteps2(input) {
  const matrix = parseMatrix(input);
  const rows = matrix.length;
  const cols = matrix[0].length;
  const paths = [];
  const path = [];
  const frames = [];
  const steps = [];
  const counts = new Map();
  let longest = 0;
  let processedRoots = 0;

  const lineOf = (source) => SOURCE2.indexOf(source) + 1;
  const L = {
    setup: lineOf("        rows, cols = len(matrix), len(matrix[0])"),
    paths: lineOf("        paths = []"),
    path: lineOf("        path = []"),
    define: lineOf("        def dfs(pos, moving, ceiling, mask):"),
    append: lineOf("            path.append((r, c))"),
    record: lineOf("            paths.append(path.copy())"),
    recurse: lineOf("                dfs(nxt, next_moving, next_ceiling, mask | (1 << nxt))"),
    pop: lineOf("            path.pop()"),
    roots: lineOf("        for start in range(rows * cols):"),
    call: lineOf("            dfs(start, False, -1, 1 << start)"),
    longest: lineOf("        longest = max(map(len, paths), default=0)"),
    done: lineOf("        return longest, paths"),
  };

  const copyPath = (value = path) => value.map((cell) => [...cell]);
  const pathValues = (value) => value.map(([r, c]) => matrix[r][c]);
  const sortedCounts = () => [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([length, count]) => ({ length, count }));

  const emit = ({ line, phase, title, note, next = null, move = null, savedPath = null, final = false, groups = [] }) => {
    const frame = frames.at(-1) || null;
    const current = frame ? [frame.r, frame.c] : null;
    steps.push({
      arr: [],
      codeBlock: 2,
      codeLines: [line],
      title,
      note,
      final,
      vars: [
        { name: "len(paths)", value: paths.length },
        { name: "longest", value: longest },
        { name: "path", value: path.map((cell) => `(${cell.join(",")})`).join(" → ") || "[]" },
        { name: "mode", value: frame?.mode || "—" },
        { name: "ceiling", value: frame?.ceiling ?? "—" },
      ],
      springboardMatrix9020View: {
        problemId: 9020,
        method: 2,
        matrix: matrix.map((row) => [...row]),
        phase,
        current,
        next: next ? [...next] : null,
        currentHeight: current ? matrix[current[0]][current[1]] : null,
        mode: frame?.mode || "rest",
        ceiling: frame?.ceiling ?? null,
        path: copyPath(),
        savedPath: savedPath ? copyPath(savedPath) : paths.length ? copyPath(paths.at(-1)) : [],
        move: move ? { ...move, from: [...move.from], to: [...move.to] } : null,
        count: paths.length,
        longest,
        counts: sortedCounts(),
        groups: groups.map((group) => ({
          length: group.length,
          longest: group.length === longest,
          paths: group.paths.map((cells) => ({ coordinates: copyPath(cells), values: pathValues(cells) })),
        })),
        processedRoots,
        totalRoots: rows * cols,
        answer: final ? longest : null,
        line,
      },
    });
  };

  emit({
    line: L.setup,
    phase: "setup",
    title: bi(`Ma trận ${rows}×${cols}`, `${rows}×${cols} matrix`),
    note: bi("Cách 2 lưu một bản sao của mọi prefix hợp lệ từ mọi điểm bắt đầu.", "Approach 2 stores a copy of every valid prefix from every starting cell."),
  });
  emit({
    line: L.paths,
    phase: "paths-init",
    title: bi("paths = []", "paths = []"),
    note: bi("Danh sách này giữ nguyên các đường sau khi DFS backtrack.", "This list preserves paths after DFS backtracks."),
  });
  emit({
    line: L.path,
    phase: "path-init",
    title: bi("path = []", "path = []"),
    note: bi("path là nhánh DFS đang chạy: append trước khi đi sâu, pop khi quay lui.", "path is the active DFS branch: append before descending, pop while backtracking."),
  });
  emit({
    line: L.define,
    phase: "define",
    title: bi("DFS giữ state physics và visited mask", "DFS keeps physics state and visited mask"),
    note: bi("Không memoize vì cần giữ từng đường tọa độ riêng biệt.", "Do not memoize because every distinct coordinate path must be retained."),
  });

  const dfs = (pos, mode, ceiling, mask) => {
    const r = Math.floor(pos / cols);
    const c = pos % cols;
    frames.push({ r, c, mode, ceiling });
    path.push([r, c]);
    emit({
      line: L.append,
      phase: "append",
      title: bi(`Thêm (${r},${c}) vào path`, `Append (${r},${c}) to path`),
      note: bi(`Nhánh hiện tại có ${path.length} cell.`, `The active branch now contains ${path.length} cells.`),
    });

    const savedPath = copyPath();
    paths.push(savedPath);
    counts.set(savedPath.length, (counts.get(savedPath.length) || 0) + 1);
    longest = Math.max(longest, savedPath.length);
    emit({
      line: L.record,
      phase: "record",
      savedPath,
      title: bi(`Lưu đường #${paths.length}, dài ${savedPath.length}`, `Save path #${paths.length}, length ${savedPath.length}`),
      note: bi("path.copy() tạo bản ghi độc lập trước khi DFS thay đổi path.", "path.copy() creates an independent record before DFS changes path."),
    });

    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nextPos = nr * cols + nc;
      if ((mask & (1 << nextPos)) !== 0) continue;
      const transition = classifyMove(matrix, cols, [r, c], [nr, nc], mode, ceiling);
      if (!transition.allowed) continue;
      const move = { from: [r, c], to: [nr, nc], ...transition };
      emit({
        line: L.recurse,
        phase: "extend",
        next: [nr, nc],
        move,
        title: bi(`Mở rộng sang (${nr},${nc})`, `Extend to (${nr},${nc})`),
        note: transition.rule === "spring"
          ? bi("Bật lên trong trần rồi chuyển về đứng yên.", "Spring upward within the ceiling, then return to rest.")
          : bi("Đi xuống và tiếp tục mang đà với trần thấp hơn.", "Descend and keep momentum with a lower ceiling."),
      });
      dfs(nextPos, transition.nextMode, transition.nextCeiling, mask | (1 << nextPos));
    }

    path.pop();
    frames.pop();
    emit({
      line: L.pop,
      phase: "backtrack",
      title: bi(`Backtrack khỏi (${r},${c})`, `Backtrack from (${r},${c})`),
      note: bi("Bản sao trong paths vẫn còn; path được khôi phục để thử nhánh khác.", "The copy in paths remains; path is restored to try another branch."),
    });
  };

  for (let start = 0; start < rows * cols; start += 1) {
    const r = Math.floor(start / cols);
    const c = start % cols;
    emit({
      line: L.roots,
      phase: "root",
      title: bi(`Chọn điểm bắt đầu (${r},${c})`, `Choose starting cell (${r},${c})`),
      note: bi("Mỗi cell đều có thể là điểm xuất phát khi đang đứng yên.", "Every cell may be a starting point at rest."),
    });
    emit({
      line: L.call,
      phase: "root-call",
      title: bi(`dfs(${start}, False, -1, 1 << ${start})`, `dfs(${start}, False, -1, 1 << ${start})`),
      note: bi("Bit của cell gốc được bật ngay để không quay lại nó.", "The root bit is set immediately so it cannot be revisited."),
    });
    dfs(start, "rest", null, 1 << start);
    processedRoots += 1;
  }

  emit({
    line: L.longest,
    phase: "group",
    title: bi(`Nhóm ${paths.length} đường theo độ dài`, `Group ${paths.length} paths by length`),
    note: bi(`Độ dài lớn nhất là ${longest}; giữ cả các đường ngắn hơn.`, `The maximum length is ${longest}; shorter paths are retained too.`),
  });
  const grouped = sortedCounts().map(({ length }) => ({
    length,
    paths: paths.filter((cells) => cells.length === length),
  }));
  emit({
    line: L.done,
    phase: "done",
    title: bi(`${paths.length} đường đã lưu · dài nhất ${longest}`, `${paths.length} paths stored · longest ${longest}`),
    note: bi("Các đường trùng dãy độ cao vẫn được giữ riêng nếu tọa độ khác nhau.", "Paths with identical height sequences remain separate when their coordinates differ."),
    groups: grouped,
    final: true,
  });

  return {
    original: matrix.map((row) => [...row]),
    answer: longest,
    allPaths: paths.map(copyPath),
    groups: grouped.map((group) => ({ length: group.length, paths: group.paths.map(copyPath) })),
    steps,
  };
}

function buildSteps3(input) {
  const matrix = parseMatrix(input);
  const rows = matrix.length;
  const cols = matrix[0].length;
  // Match the direction order in the supplied Python solution.
  const directions = [DIRECTIONS[2], DIRECTIONS[0], DIRECTIONS[1], DIRECTIONS[3]];
  const visited = new Set();
  const path = [];
  const frames = [];
  const steps = [];
  const traceLimit = 1200;
  let statesExplored = 0;
  let skippedSteps = 0;
  let processedRoots = 0;
  let answer = 0;
  let bestPath = [];
  const copyPath = (cells) => cells.map((cell) => [...cell]);
  const keyOf = (r, c) => `${r},${c}`;
  const lineOf = (source) => SOURCE3.indexOf(source) + 1;
  const L = {
    setup: lineOf("        rows, cols = len(matrix), len(matrix[0])"),
    init: lineOf("        visited = set()"),
    add: lineOf("            visited.add((r, c))"),
    best: lineOf("            best = 1"),
    outside: lineOf("                if not (0 <= nr < rows and 0 <= nc < cols):"),
    visited: lineOf("                if (nr, nc) in visited:"),
    height: lineOf("                next_height = matrix[nr][nc]"),
    launch: lineOf("                    next_down = True"),
    tooHigh: lineOf("                    if next_height > height:"),
    coast: lineOf("                elif next_height <= height:"),
    spring: lineOf("                    next_down = False"),
    reject: lineOf("                else:"),
    call: lineOf("                    1 + dfs(nr, nc, next_down, next_ceiling)"),
    update: lineOf("                best = max("),
    remove: lineOf("            visited.remove((r, c))"),
    return: lineOf("            return best"),
    root: lineOf("                answer = max(answer, dfs(r, c, False, -1))"),
    done: lineOf("        return answer"),
  };

  const emit = ({ line, phase, title, note, next = null, nextMove = null, removed = null, returned = null, final = false }) => {
    if (!final && steps.length >= traceLimit) {
      skippedSteps += 1;
      return;
    }
    const frame = frames.at(-1);
    const current = frame ? [frame.r, frame.c] : null;
    const candidates = frame ? directions.map(([dr, dc, arrow, direction]) => {
      const nr = frame.r + dr;
      const nc = frame.c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        return { direction, arrow, cell: [nr, nc], height: null, allowed: false, rule: "outside", visited: false };
      }
      const wasVisited = visited.has(keyOf(nr, nc));
      const move = classifyMove(matrix, cols, current, [nr, nc], frame.mode, frame.ceiling);
      return { direction, arrow, cell: [nr, nc], height: matrix[nr][nc], ...move, allowed: !wasVisited && move.allowed, visited: wasVisited };
    }) : [];
    const route = final ? bestPath : path;
    const replay = route.length ? buildReplayStates(matrix, route.map(([r, c]) => r * cols + c)) : { moves: [] };
    steps.push({
      arr: [], codeBlock: 3, codeLines: [line], title, note, final,
      vars: [
        { name: "visited", value: `{${[...visited].map((key) => `(${key})`).join(", ")}}` },
        { name: "moving_down", value: frame?.mode === "momentum" ? "True" : "False" },
        { name: "ceiling", value: frame?.ceiling ?? -1 },
        { name: "best", value: frame?.best ?? "—" },
        { name: "answer", value: answer },
      ],
      springboardMatrix9020View: {
        problemId: 9020, method: 3, matrix: copyPath(matrix), phase, current,
        currentHeight: current ? matrix[current[0]][current[1]] : null,
        mode: frame?.mode || "rest", ceiling: frame?.ceiling ?? null,
        path: copyPath(path), visited: [...visited].map((key) => key.split(",").map(Number)),
        bestPath: copyPath(route), optimalPath: copyPath(bestPath), moves: replay.moves,
        next: next ? [...next] : null, nextMove, candidates, removed, returned,
        localBest: frame?.best ?? null, answer, statesExplored, processedRoots,
        totalRoots: rows * cols, skippedSteps, line,
      },
    });
  };

  emit({ line: L.setup, phase: "setup", title: bi(`Ma trận ${rows}×${cols}`, `${rows}×${cols} matrix`), note: bi("Thử DFS từ mỗi cell khi đang đứng yên.", "Try DFS from every cell at rest.") });
  emit({ line: L.init, phase: "init", title: bi("visited = set()", "visited = set()"), note: bi("Set chỉ giữ các cell trên nhánh DFS hiện tại.", "The set contains only cells on the active DFS branch.") });

  const dfs = (r, c, mode, ceiling) => {
    const frame = { r, c, mode, ceiling, best: 1 };
    frames.push(frame);
    path.push([r, c]);
    visited.add(keyOf(r, c));
    statesExplored += 1;
    let suffix = [[r, c]];
    emit({ line: L.add, phase: "add", title: bi(`visited.add((${r}, ${c}))`, `visited.add((${r}, ${c}))`), note: bi("Đánh dấu cell trước khi đi sâu để chặn quay lại.", "Mark this cell before descending to prevent revisits.") });
    emit({ line: L.best, phase: "best-init", title: bi("best = 1", "best = 1"), note: bi("Nếu không đi tiếp được, đường từ đây vẫn có một cell.", "If no next jump is possible, the path from here still contains one cell.") });
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const next = [nr, nc];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        emit({ line: L.outside, phase: "reject", title: bi(`Bỏ (${nr},${nc}): ngoài matrix`, `Skip (${nr},${nc}): outside matrix`), note: bi("Không gọi DFS.", "Do not call DFS.") });
        continue;
      }
      if (visited.has(keyOf(nr, nc))) {
        emit({ line: L.visited, phase: "reject", next, title: bi(`Bỏ (${nr},${nc}): đã có trong visited`, `Skip (${nr},${nc}): already in visited`), note: bi("Mỗi cell chỉ xuất hiện một lần trên một đường.", "Each cell appears only once in a path.") });
        continue;
      }
      const transition = classifyMove(matrix, cols, [r, c], next, mode, ceiling);
      const nextMove = { from: [r, c], to: next, ...transition };
      emit({ line: L.height, phase: "inspect", next, title: bi(`Xét độ cao ${matrix[nr][nc]}`, `Inspect height ${matrix[nr][nc]}`), note: bi("So với độ cao hiện tại và trần bật.", "Compare with the current height and spring ceiling.") });
      if (!transition.allowed) {
        emit({ line: mode === "rest" ? L.tooHigh : L.reject, phase: "reject", next, title: bi(`Không thể nhảy tới (${nr},${nc})`, `Cannot jump to (${nr},${nc})`), note: mode === "rest" ? bi("Đang đứng yên: cell kế bên cao hơn.", "At rest: the adjacent cell is higher.") : bi(`Độ cao mới vượt trần ${ceiling}.`, `The new height exceeds ceiling ${ceiling}.`) });
        continue;
      }
      emit({ line: L[transition.rule], phase: "move", next, nextMove, title: bi(`${matrix[r][c]} → ${matrix[nr][nc]}`, `${matrix[r][c]} → ${matrix[nr][nc]}`), note: transition.rule === "spring" ? bi("Bật lên trong trần → đứng yên, ceiling = -1.", "Spring upward within the ceiling → rest, ceiling = -1.") : bi(`Đi xuống → còn đà, ceiling = ${matrix[r][c]}.`, `Descend → momentum, ceiling = ${matrix[r][c]}.`) });
      emit({ line: L.call, phase: "recurse", next, nextMove, title: bi(`Gọi dfs(${nr}, ${nc}, ${transition.nextMode === "momentum" ? "True" : "False"}, ${transition.nextCeiling ?? -1})`, `Call dfs(${nr}, ${nc}, ${transition.nextMode === "momentum" ? "True" : "False"}, ${transition.nextCeiling ?? -1})`), note: bi("Giữ nguyên visited của nhánh cha khi đi sâu.", "Keep the parent branch's visited cells while descending.") });
      const child = dfs(nr, nc, transition.nextMode, transition.nextCeiling);
      const previous = frame.best;
      frame.best = Math.max(frame.best, 1 + child.length);
      if (frame.best > previous) suffix = [[r, c], ...child.path];
      emit({ line: L.update, phase: "update", returned: child.length, title: bi(`best = max(${previous}, 1 + ${child.length}) = ${frame.best}`, `best = max(${previous}, 1 + ${child.length}) = ${frame.best}`), note: bi("DFS con đã xóa cell của nó; visited trở về nhánh cha.", "The child DFS removed its cell; visited is restored to the parent branch.") });
    }
    visited.delete(keyOf(r, c));
    path.pop();
    emit({ line: L.remove, phase: "remove", removed: [r, c], title: bi(`visited.remove((${r}, ${c}))`, `visited.remove((${r}, ${c}))`), note: bi("Cell này được dùng lại trong một nhánh khác.", "This cell may be used again in another branch.") });
    emit({ line: L.return, phase: "return", returned: frame.best, title: bi(`return ${frame.best}`, `return ${frame.best}`), note: bi("Trả độ dài tốt nhất bắt đầu tại cell này.", "Return the best length starting at this cell.") });
    frames.pop();
    return { length: frame.best, path: suffix };
  };

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      emit({ line: L.root, phase: "root", title: bi(`Bắt đầu tại (${r},${c})`, `Start at (${r},${c})`), note: bi("visited rỗng; bắt đầu ở trạng thái đứng yên.", "visited is empty; start at rest.") });
      const result = dfs(r, c, "rest", null);
      if (result.length > answer) {
        answer = result.length;
        bestPath = copyPath(result.path);
      }
      processedRoots += 1;
      emit({ line: L.root, phase: "root-done", returned: result.length, title: bi(`answer = ${answer}`, `answer = ${answer}`), note: bi(`Đã thử ${processedRoots}/${rows * cols} điểm bắt đầu; visited lại rỗng.`, `Tried ${processedRoots}/${rows * cols} starting cells; visited is empty again.`) });
    }
  }
  emit({ line: L.done, phase: "done", final: true, title: bi(`Đường dài nhất: ${answer} cell`, `Longest path: ${answer} cells`), note: skippedSteps ? bi(`Đã xét đầy đủ ${statesExplored} lượt DFS. Hiển thị ${traceLimit} bước đầu và kết quả để giữ visualization nhẹ.`, `All ${statesExplored} DFS calls were searched. Show the first ${traceLimit} steps and the result to keep the visualization responsive.`) : bi("Đã thử mọi điểm bắt đầu và mọi nhánh hợp lệ; visited cuối cùng rỗng.", "Tried every starting cell and every legal branch; visited ends empty.") });
  return { original: copyPath(matrix), answer, path: copyPath(bestPath), statesExplored, skippedSteps, steps };
}

module.exports = {
  9020: {
    id: 9020,
    difficulty: "hard",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [
      { key: "matrix", vi: "Ma trận", en: "Matrix" },
      { key: "dfs", vi: "DFS", en: "DFS" },
      { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
      { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    ],
    title: bi("Springboard Matrix: Longest Physics Path", "Springboard Matrix: Longest Physics Path"),
    titleVi: bi("Đường nhảy lò xo dài nhất", "Longest springboard physics path"),
    statement: bi(
      "Tìm đường đi dài nhất trong ma trận độ cao. Từ trạng thái đứng yên chỉ được nhảy sang cell kề thấp hơn hoặc bằng. Khi còn đà, có thể tiếp tục đi xuống (trần đà hạ xuống độ cao vừa rời đi), hoặc bật lên không vượt trần rồi trở về đứng yên. Mỗi cell được ghé tối đa một lần. Visualization nhận tối đa 12 cell (≤4×4).",
      "Find the longest path in a height matrix. From rest, jump only to an equal or lower adjacent cell. With momentum, either keep descending (the ceiling drops to the height just left) or spring upward no higher than the ceiling and return to rest. Visit each cell at most once. The visualization accepts at most 12 cells (≤4×4).",
    ),
    defaultInput: "9,6,8;5,4,7;3,2,1",
    inputKind: "string",
    inputLabel: bi("Ma trận độ cao (hàng ngăn bằng ;)", "Height matrix (rows separated by ;)"),
    extraParams: [{
      key: "approach",
      type: "select",
      default: 1,
      label: bi("Cách giải", "Approach"),
      options: [
        { value: 1, label: bi("Cách 1: DFS + memo, lấy một đường tối ưu", "Approach 1: memoized DFS, one optimal path") },
        { value: 2, label: bi("Cách 2: Backtracking, lưu mọi đường", "Approach 2: backtracking, store every path") },
        { value: 3, label: bi("Cách 3: DFS + visited set, không bitmask", "Approach 3: DFS + visited set, no bitmask") },
      ],
    }],
    debugMode: "line-by-line",
    approach: [
      bi("State gồm vị trí, mode đứng yên/còn đà, trần bật và bitmask các cell đã ghé.", "A state contains position, rest/momentum mode, spring ceiling, and the visited-cell bitmask."),
      bi("Đứng yên: chỉ đi tới độ cao ≤ hiện tại và bắt đầu có đà.", "At rest: move only to a height ≤ the current one and gain momentum."),
      bi("Còn đà: đi xuống giữ đà nhưng hạ trần; bật lên trong trần sẽ tiêu đà và đứng yên.", "With momentum: descending keeps momentum but lowers the ceiling; springing upward within the ceiling spends momentum and returns to rest."),
      bi("DFS memoization thử mọi điểm bắt đầu; bitmask bảo đảm mỗi cell chỉ xuất hiện một lần trên đường.", "Memoized DFS tries every starting cell; the bitmask ensures every cell appears at most once in a path."),
      bi("Follow-up Cách 2 bỏ memoization, dùng path.copy() để lưu mọi đường hợp lệ trước khi backtrack.", "Follow-up Approach 2 drops memoization and uses path.copy() to store every valid path before backtracking."),
      bi("Danh sách được nhóm theo độ dài; các đường trùng giá trị nhưng khác tọa độ vẫn là hai đường riêng.", "The list is grouped by length; identical value sequences at different coordinates remain separate paths."),
      bi("Cách 3 dùng visited set: add khi vào DFS, remove trước khi return để thử nhánh khác; không cần bitmask.", "Approach 3 uses a visited set: add on DFS entry, remove before returning to explore other branches; no bitmask is needed."),
    ],
    complexity: {
      time: "O(n² · 2ⁿ)",
      space: "O(n² · 2ⁿ)",
      note: bi("n = M×N. Ràng buộc không ghé lại biến bài toán thành longest simple path theo state physics, nên lời giải chính xác là exponential.", "n = M×N. The no-revisit rule turns this into a longest simple path over physics states, so the exact solution is exponential."),
    },
    complexity2: {
      time: "O(P · n)",
      space: "O(P · n)",
      note: bi("P là số đường hợp lệ được lưu, n = M×N. Mỗi đường được copy nên chi phí tỉ lệ tổng số cell trong toàn bộ danh sách.", "P is the number of stored valid paths and n = M×N. Every path is copied, so cost is proportional to the total cells across the complete list."),
    },
    complexity3: {
      time: "O(n · 3ⁿ)",
      space: "O(n)",
      note: bi("n = M×N. Thử mọi điểm bắt đầu; mỗi bước sau bước đầu có tối đa 3 hướng vì không quay lại cell trước. visited và stack có tối đa n cell; không memoization.", "n = M×N. Try every starting cell; after the first jump, each step has at most 3 directions because the previous cell is visited. The visited set and stack hold at most n cells; no memoization."),
    },
    code: SOURCE,
    codeLabel: bi("Cách 1: DFS + memoization", "Approach 1: DFS + memoization"),
    code2: SOURCE2,
    code2Label: bi("Cách 2: Liệt kê và lưu mọi đường", "Approach 2: enumerate and store every path"),
    code3: SOURCE3,
    code3Label: bi("Cách 3: DFS + visited set (không bitmask)", "Approach 3: DFS + visited set (no bitmask)"),
    builder: buildSteps,
    builder2: buildSteps2,
    builder3: buildSteps3,
    liveArgs: (input) => [parseMatrix(input)],
    parseSpringboardMatrix9020Input: parseMatrix,
    solvePhysicsPath9020: solvePhysicsPath,
  },
};
