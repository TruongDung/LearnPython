"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "from collections import deque",
  "import heapq",
  "",
  "class Solution:",
  "    def maximumSafenessFactor(self, grid: list[list[int]]) -> int:",
  "        n = len(grid)",
  "        distance = [[-1] * n for _ in range(n)]",
  "        queue = deque()",
  "",
  "        for r in range(n):",
  "            for c in range(n):",
  "                if grid[r][c] == 1:",
  "                    distance[r][c] = 0",
  "                    queue.append((r, c))",
  "",
  "        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))",
  "        while queue:",
  "            r, c = queue.popleft()",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if (0 <= nr < n and 0 <= nc < n and",
  "                        distance[nr][nc] == -1):",
  "                    distance[nr][nc] = distance[r][c] + 1",
  "                    queue.append((nr, nc))",
  "",
  "        best = [[-1] * n for _ in range(n)]",
  "        best[0][0] = distance[0][0]",
  "        heap = [(-best[0][0], 0, 0)]",
  "",
  "        while heap:",
  "            neg_safe, r, c = heapq.heappop(heap)",
  "            safe = -neg_safe",
  "            if safe < best[r][c]:",
  "                continue",
  "            if r == n - 1 and c == n - 1:",
  "                return safe",
  "",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if 0 <= nr < n and 0 <= nc < n:",
  "                    candidate = min(safe, distance[nr][nc])",
  "                    if candidate > best[nr][nc]:",
  "                        best[nr][nc] = candidate",
  "                        heapq.heappush(heap, (-candidate, nr, nc))",
  "",
  "        return 0",
]);

function parseInput(input) {
  let grid = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.startsWith("[")) {
      try { grid = JSON.parse(text); }
      catch { throw new Error("2812: JSON lưới không hợp lệ / Invalid grid JSON."); }
    } else {
      grid = text.split(/[|;]/).map((row) => row.split(",").map((value) => value.trim() === "" ? NaN : Number(value.trim())));
    }
  }
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 400 || !grid.every((row) => Array.isArray(row) && row.length === grid.length)) {
    throw new RangeError("2812: lưới vuông 1..400 / Square grid with 1..400 rows.");
  }
  if (grid.some((row) => row.some((value) => value !== 0 && value !== 1))) {
    throw new RangeError("2812: mỗi ô phải là 0 hoặc 1 / Every cell must be 0 or 1.");
  }
  if (!grid.some((row) => row.includes(1))) {
    throw new RangeError("2812: lưới phải có ít nhất một tên trộm / Grid must contain at least one thief.");
  }
  return grid.map((row) => [...row]);
}

const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && (a[1] < b[1] || (a[1] === b[1] && a[2] < b[2])));
function siftUp(heap, start, position) {
  const item = heap[position];
  while (position > start) {
    const parent = (position - 1) >> 1;
    if (!less(item, heap[parent])) break;
    heap[position] = heap[parent];
    position = parent;
  }
  heap[position] = item;
}
function push(heap, item) { heap.push(item); siftUp(heap, 0, heap.length - 1); }
function pop(heap) {
  const last = heap.pop();
  if (!heap.length) return last;
  const first = heap[0];
  let position = 0;
  let child = 1;
  while (child < heap.length) {
    const right = child + 1;
    if (right < heap.length && !less(heap[child], heap[right])) child = right;
    heap[position] = heap[child];
    position = child;
    child = position * 2 + 1;
  }
  heap[position] = last;
  siftUp(heap, 0, position);
  return first;
}

function reachableAt(distance, threshold) {
  const n = distance.length;
  if (distance[0][0] < threshold) return false;
  const queue = [[0, 0]];
  const seen = new Set([0]);
  for (let index = 0; index < queue.length; index += 1) {
    const [r, c] = queue[index];
    if (r === n - 1 && c === n - 1) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const id = nr * n + nc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && distance[nr][nc] >= threshold && !seen.has(id)) {
        seen.add(id);
        queue.push([nr, nc]);
      }
    }
  }
  return false;
}

function buildSteps(input) {
  const grid = parseInput(input);
  const size = grid.length;
  const steps = [];
  const cap = 1800;
  let events = 0;
  let omitted = 0;
  let mode = "distance";
  let n;
  let distance;
  let queue;
  let head = 0;
  let directions;
  let best;
  let heap;
  let neg_safe;
  let safe;
  let r;
  let c;
  let dr;
  let dc;
  let nr;
  let nc;
  let candidate;
  let scanR;
  let scanC;
  let probe = null;
  const settled = new Set();
  const parent = Array.from({ length: size }, () => Array(size).fill(null));

  const axis = (coordinate) => size <= 7
    ? Array.from({ length: size }, (_, index) => index)
    : [...new Set([0, 1, size - 2, size - 1, coordinate - 1, coordinate, coordinate + 1])]
      .filter((index) => Number.isInteger(index) && index >= 0 && index < size)
      .sort((a, b) => a - b);

  function emit(line, phase, extra = {}) {
    events += 1;
    if (steps.length >= cap && !extra.final) { omitted += 1; return; }
    const focusR = Number.isInteger(r) ? r : Number.isInteger(scanR) ? scanR : 0;
    const focusC = Number.isInteger(c) ? c : Number.isInteger(scanC) ? scanC : 0;
    const rows = axis(focusR);
    const cols = axis(focusC);
    const heapPreview = (heap || []).slice(0, 12).map((entry) => [...entry]);
    const heapCells = new Set((heap || []).map(([, rr, cc]) => rr * size + cc));
    const queuedCells = new Set((queue || []).slice(head).map(([rr, cc]) => rr * size + cc));
    const locals = {};
    for (const [name, value] of Object.entries({ n, r, c, dr, dc, nr, nc, safe, neg_safe, candidate })) {
      if (value !== undefined) locals[name] = value;
    }
    const view = {
      phase,
      mode,
      size,
      source: { line, text: CODE[line - 1], timing: "before" },
      rows,
      cols,
      current: Number.isInteger(r) && Number.isInteger(c) ? [r, c] : null,
      probe: probe ? { ...probe } : null,
      queueSize: queue ? queue.length - head : 0,
      heap: heapPreview,
      safe: Number.isInteger(safe) ? safe : null,
      candidate: Number.isInteger(candidate) ? candidate : null,
      cells: rows.map((rr) => cols.map((cc) => ({
        r: rr,
        c: cc,
        thief: grid[rr][cc] === 1,
        distance: distance ? distance[rr][cc] : null,
        best: best ? best[rr][cc] : null,
        queued: queuedCells.has(rr * size + cc),
        inHeap: heapCells.has(rr * size + cc),
        settled: settled.has(rr * size + cc),
      }))),
      cropped: rows.length < size || cols.length < size,
      final: false,
      answer: null,
      path: [],
      higherReachable: null,
      ...extra,
    };
    steps.push({
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      final: Boolean(extra.final),
      title: bi("Đường đi an toàn nhất", "The safest path"),
      note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      safest2812View: view,
    });
  }

  emit(6, "size"); n = size;
  emit(7, "distance-init"); distance = Array.from({ length: n }, () => Array(n).fill(-1));
  emit(8, "queue-init"); queue = [];
  for (scanR = 0; scanR < n; scanR += 1) {
    emit(10, "scan-row");
    for (scanC = 0; scanC < n; scanC += 1) {
      emit(11, "scan-cell");
      emit(12, "find-thief");
      if (grid[scanR][scanC] === 1) {
        emit(13, "mark-thief"); distance[scanR][scanC] = 0;
        emit(14, "seed-thief"); queue.push([scanR, scanC]);
      }
    }
  }
  scanR = undefined; scanC = undefined;
  emit(16, "directions"); directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (true) {
    emit(17, "wave-check");
    if (head >= queue.length) break;
    emit(18, "wave-pop"); [r, c] = queue[head]; head += 1;
    for (let index = 0; ; index += 1) {
      emit(19, "wave-direction");
      if (index === directions.length) break;
      [dr, dc] = directions[index];
      emit(20, "wave-neighbor"); nr = r + dr; nc = c + dc;
      const inside = nr >= 0 && nr < n && nc >= 0 && nc < n;
      probe = { r: nr, c: nc, inside, distance: inside ? distance[nr][nc] : null };
      emit(21, "wave-bounds");
      emit(22, "wave-unseen");
      if (inside && distance[nr][nc] === -1) {
        emit(23, "wave-distance"); distance[nr][nc] = distance[r][c] + 1; probe.distance = distance[nr][nc];
        emit(24, "wave-push"); queue.push([nr, nc]);
      }
    }
  }
  probe = null;
  r = undefined; c = undefined; dr = undefined; dc = undefined; nr = undefined; nc = undefined;
  safe = undefined; neg_safe = undefined; candidate = undefined;
  mode = "path";
  emit(26, "best-init"); best = Array.from({ length: n }, () => Array(n).fill(-1));
  emit(27, "best-start"); best[0][0] = distance[0][0];
  emit(28, "heap-seed"); heap = [[0 - best[0][0], 0, 0]];
  while (true) {
    emit(30, "heap-check");
    if (!heap.length) break;
    probe = null;
    emit(31, "heap-pop"); [neg_safe, r, c] = pop(heap);
    emit(32, "decode-safe"); safe = 0 - neg_safe;
    emit(33, "stale-check");
    if (safe < best[r][c]) { emit(34, "skip-stale"); continue; }
    settled.add(r * n + c);
    emit(35, "target-check");
    if (r === n - 1 && c === n - 1) {
      const path = [];
      for (let cell = [r, c]; cell; cell = parent[cell[0]][cell[1]]) {
        path.push([cell[0], cell[1], distance[cell[0]][cell[1]]]);
      }
      path.reverse();
      emit(36, "done", { final: true, answer: safe, path, higherReachable: reachableAt(distance, safe + 1) });
      const trace = { events, captured: steps.length, omitted, truncated: omitted > 0 };
      for (const step of steps) step.safest2812View.trace = trace;
      return { original: grid, grid, distance, answer: safe, steps };
    }
    for (let index = 0; ; index += 1) {
      emit(38, "path-direction");
      if (index === directions.length) break;
      [dr, dc] = directions[index];
      emit(39, "path-neighbor"); nr = r + dr; nc = c + dc;
      const inside = nr >= 0 && nr < n && nc >= 0 && nc < n;
      probe = { r: nr, c: nc, inside, distance: inside ? distance[nr][nc] : null, oldBest: inside ? best[nr][nc] : null, candidate: null };
      emit(40, "path-bounds");
      if (!inside) continue;
      emit(41, "candidate"); candidate = Math.min(safe, distance[nr][nc]); probe.candidate = candidate;
      emit(42, "better-check");
      if (candidate > best[nr][nc]) {
        emit(43, "best-update"); best[nr][nc] = candidate; parent[nr][nc] = [r, c];
        emit(44, "heap-push"); push(heap, [0 - candidate, nr, nc]);
      }
    }
  }
  throw new Error("2812: a square grid with a thief must have a path.");
}

module.exports = {
  2812: {
    id: 2812,
    difficulty: "medium",
    slug: "find-the-safest-path-in-a-grid",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [
      { key: "multi-source-bfs", vi: "Multi-source BFS", en: "Multi-source BFS" },
      { key: "dijkstra", vi: "Dijkstra", en: "Dijkstra" },
      { key: "minimax", vi: "Maximin", en: "Maximin" },
    ],
    title: bi("Find the Safest Path in a Grid", "Find the Safest Path in a Grid"),
    titleVi: bi("BFS nhiều nguồn + đường đi Maximin", "Multi-source BFS + Maximin path"),
    statement: bi(
      "Ô 1 có tên trộm, ô 0 an toàn. Đi 4 hướng từ S tới T. Độ an toàn của đường là khoảng cách Manhattan nhỏ nhất tới một tên trộm trên toàn đường; hãy làm giá trị đó lớn nhất.",
      "Cells with 1 contain thieves. Move in four directions from S to T. A path's safeness is the smallest Manhattan distance to any thief along it; maximize that value.",
    ),
    defaultInput: "[[0,0,1],[0,0,0],[0,0,0]]",
    inputKind: "string",
    singleInput: true,
    inputLabel: bi("grid · JSON vuông gồm 0/1", "grid · square 0/1 JSON"),
    debugMode: "line-by-line",
    approach: [
      bi("BFS nhiều nguồn từ tất cả tên trộm → distance[r][c] tới tên trộm gần nhất.", "Multi-source BFS from every thief → distance[r][c] to the nearest thief."),
      bi("Max-heap đi từ S; điểm của đường = min(điểm cũ, distance của ô kế).", "Run a max-heap from S; path score = min(old score, the next cell's distance)."),
      bi("Lần đầu pop T là đáp án lớn nhất. Đây là Dijkstra Maximin, không cộng trọng số.", "The first valid pop of T is optimal. This is Maximin Dijkstra; distances are not added."),
    ],
    complexity: {
      time: "O(n² log n)",
      space: "O(n²)",
      note: bi("BFS tính bản đồ khoảng cách O(n²); max-heap xử lý tối đa n² ô.", "BFS builds the distance map in O(n²); the max-heap processes at most n² cells."),
    },
    code: CODE,
    builder: buildSteps,
    parseInput,
    liveArgs: (input) => [parseInput(input)],
  },
};

module.exports.buildSteps = buildSteps;
