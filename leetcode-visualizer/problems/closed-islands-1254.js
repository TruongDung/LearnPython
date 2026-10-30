"use strict";

const base = require("./flood-fill")[1254];
const bi = (vi, en) => ({ vi, en });
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const BORDER_BFS = [
  "from collections import deque",
  "class Solution:",
  "    def closedIsland(self, grid):",
  "        rows, cols = len(grid), len(grid[0])",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "        queue = deque()",
  "        for r in range(rows):",
  "            for c in (0, cols - 1):",
  "                if grid[r][c] == 0:",
  "                    grid[r][c] = 1",
  "                    queue.append((r, c))",
  "        for c in range(cols):",
  "            for r in (0, rows - 1):",
  "                if grid[r][c] == 0:",
  "                    grid[r][c] = 1",
  "                    queue.append((r, c))",
  "        while queue:",
  "            r, c = queue.popleft()",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:",
  "                    grid[nr][nc] = 1",
  "                    queue.append((nr, nc))",
  "        count = 0",
  "        for r in range(1, rows - 1):",
  "            for c in range(1, cols - 1):",
  "                if grid[r][c] == 0:",
  "                    count += 1",
  "                    queue = deque([(r, c)])",
  "                    grid[r][c] = 1",
  "                    while queue:",
  "                        cr, cc = queue.popleft()",
  "                        for dr, dc in directions:",
  "                            nr, nc = cr + dr, cc + dc",
  "                            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:",
  "                                grid[nr][nc] = 1",
  "                                queue.append((nr, nc))",
  "        return count",
];

function componentCode(queue = false) {
  const work = queue ? "queue" : "stack";
  return [
    ...(queue ? ["from collections import deque"] : []),
    "class Solution:",
    "    def closedIsland(self, grid):",
    "        rows, cols = len(grid), len(grid[0])",
    "        visited = [[False] * cols for _ in range(rows)]",
    "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
    "        count = 0",
    "        for r in range(rows):",
    "            for c in range(cols):",
    "                if grid[r][c] == 0 and not visited[r][c]:",
    `                    ${work} = ${queue ? "deque([(r, c)])" : "[(r, c)]"}`,
    "                    visited[r][c] = True",
    "                    touches_border = False",
    `                    while ${work}:`,
    `                        cr, cc = ${work}.${queue ? "popleft" : "pop"}()`,
    "                        if cr == 0 or cr == rows - 1 or cc == 0 or cc == cols - 1:",
    "                            touches_border = True",
    "                        for dr, dc in directions:",
    "                            nr, nc = cr + dr, cc + dc",
    "                            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and not visited[nr][nc]:",
    "                                visited[nr][nc] = True",
    `                                ${work}.append((nr, nc))`,
    "                    if not touches_border:",
    "                        count += 1",
    "        return count",
  ];
}

const DFS_COMPONENTS = componentCode(false);
const BFS_COMPONENTS = componentCode(true);
const UNION_FIND = [
  "class Solution:",
  "    def closedIsland(self, grid):",
  "        rows, cols = len(grid), len(grid[0])",
  "        ocean = rows * cols",
  "        parent = list(range(ocean + 1))",
  "        def find(x):",
  "            while parent[x] != x:",
  "                parent[x] = parent[parent[x]]",
  "                x = parent[x]",
  "            return x",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                if grid[r][c] != 0:",
  "                    continue",
  "                cell = r * cols + c",
  "                if r == 0 or r == rows - 1 or c == 0 or c == cols - 1:",
  "                    parent[find(cell)] = find(ocean)",
  "                for dr, dc in [(1, 0), (0, 1)]:",
  "                    nr, nc = r + dr, c + dc",
  "                    if nr < rows and nc < cols and grid[nr][nc] == 0:",
  "                        parent[find(nr * cols + nc)] = find(cell)",
  "        roots = {find(r * cols + c) for r in range(rows) for c in range(cols)",
  "                 if grid[r][c] == 0 and find(r * cols + c) != find(ocean)}",
  "        return len(roots)",
];

const APPROACHES = [base.code, BORDER_BFS, DFS_COMPONENTS, BFS_COMPONENTS, UNION_FIND];
const LABELS = [
  ["DFS đệ quy từ biên", "Recursive DFS from the border"],
  ["BFS từ biên", "BFS from the border"],
  ["DFS + visited, loại đảo chạm biên", "DFS + visited, reject border-touching components"],
  ["BFS + visited, loại đảo chạm biên", "BFS + visited, reject border-touching components"],
  ["Union-Find + nút biển ảo", "Union-Find + virtual ocean node"],
];

function parse(input) {
  if (typeof input !== "string" || !input.trim()) throw new TypeError("#1254: enter a rectangular 0/1 grid.");
  const grid = input.trim().split("|").map(row => {
    const text = row.trim();
    return (text.includes(",") ? text.split(",") : [...text]).map(value => value.trim().replace(/^"|"$/g, ""));
  });
  if (!grid[0].length || grid.some(row => row.length !== grid[0].length || row.some(value => !/^[01]$/.test(value)))) {
    throw new TypeError("#1254: grid must be rectangular and contain only 0 and 1.");
  }
  if (grid.length < 3 || grid[0].length < 3) throw new RangeError("#1254: grid must be at least 3×3.");
  return grid.map(row => row.map(Number));
}

const clone = value => Array.isArray(value) ? value.map(clone) : value;

function build(input, approach = 1) {
  if (approach === 1) return base.builder(input);
  const original = parse(input);
  const code = APPROACHES[approach - 1];
  const rows = original.length, cols = original[0].length;
  const grid = clone(original), consumed = original.map(row => row.map(() => false));
  const islandId = original.map(row => row.map(() => 0));
  const visited = original.map(row => row.map(() => false));
  const steps = [];
  let count = 0, island = 0, current = null, work = [], phase = "flood";
  const parent = Array.from({ length: rows * cols + 1 }, (_, index) => index);
  const ocean = rows * cols;
  const sourceLine = (needle, occurrence = 0) => {
    let found = -1, start = 0;
    for (let i = 0; i <= occurrence; i++) {
      found = code.findIndex((line, index) => index >= start && line.trim() === needle.trim());
      if (found < 0) throw new Error(`#1254 approach ${approach}: source line not found: ${needle}`);
      start = found + 1;
    }
    return found + 1;
  };
  const find = value => {
    while (parent[value] !== value) value = parent[value];
    return value;
  };
  function cells() {
    return original.map((row, r) => row.map((value, c) => {
      const border = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      const kind = value === 1 ? "water" : islandId[r][c] ? "island" : consumed[r][c] ? "flooded" : "land";
      const active = current && current[0] === r && current[1] === c;
      return {
        label: String(grid[r][c]), meta: islandId[r][c] ? `#${islandId[r][c]}` : "",
        cls: active ? "current" : value === 1 ? "wall" : consumed[r][c] ? "filled" : border ? "queued" : "empty",
        kind, isBorder: border, isCurrent: Boolean(active),
      };
    }));
  }
  function snapshot(line, title, opts = {}) {
    phase = opts.phase ?? phase;
    const vars = [
      { name: "r", value: current?.[0] ?? "—" },
      { name: "c", value: current?.[1] ?? "—" },
      { name: "grid[r][c]", value: current ? grid[current[0]]?.[current[1]] ?? "—" : "—" },
      { name: "count", value: count },
      { name: "answer", value: opts.final ? count : "—" },
    ];
    steps.push({
      title: bi(title, title), arr: [], codeBlock: approach,
      bfsGrid: { rows, cols, cells: cells() }, highlight: [], mark: [],
      final: Boolean(opts.final), codeLines: [line], vars,
      note: bi(opts.note ?? "", opts.note ?? ""),
      closedIsland1254View: {
        phase, count, done: Boolean(opts.final), approach,
        worklist: clone(work), parent: approach === 5 ? parent.map((value, id) => original.flat()[id] === 0 ? [id, value] : null).filter(Boolean) : null,
        visited: approach === 3 || approach === 4 ? clone(visited) : null,
      },
    });
  }
  function mutate(r, c, marker, id = 0) {
    consumed[r][c] = true;
    grid[r][c] = marker;
    if (id) islandId[r][c] = id;
  }
  const setLine = value => sourceLine(value);

  if (approach === 2) {
    const boundarySeedLine = setLine("if grid[r][c] == 0:");
    const floodBoundary = (r, c) => {
      if (grid[r][c] !== 0) return;
      work.push([r, c]); mutate(r, c, 1);
      snapshot(setLine("queue.append((r, c))"), `Border seed (${r}, ${c}) → queue`, { note: "Mark land as water when enqueued to avoid duplicates." });
    };
    snapshot(setLine("queue = deque()"), "Initialize the border queue");
    for (let r = 0; r < rows; r++) for (const c of [0, cols - 1]) {
      current = [r, c]; snapshot(boundarySeedLine, `Check border cell (${r}, ${c})`);
      floodBoundary(r, c);
    }
    for (let c = 0; c < cols; c++) for (const r of [0, rows - 1]) {
      current = [r, c]; snapshot(boundarySeedLine, `Check border cell (${r}, ${c})`);
      floodBoundary(r, c);
    }
    while (work.length) {
      const [r, c] = work.shift(); current = [r, c];
      snapshot(setLine("r, c = queue.popleft()"), `BFS takes (${r}, ${c})`);
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc; current = [nr, nc];
        snapshot(setLine("nr, nc = r + dr, c + dc"), `Inspect (${nr}, ${nc})`);
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] !== 0) continue;
        mutate(nr, nc, 1); work.push([nr, nc]);
        snapshot(setLine("queue.append((nr, nc))"), `Flood border-connected land (${nr}, ${nc})`);
      }
    }
    snapshot(setLine("count = 0"), "Initialize closed-island count", { phase: "count" });
    for (let r = 1; r < rows - 1; r++) for (let c = 1; c < cols - 1; c++) {
      current = [r, c]; snapshot(setLine("if grid[r][c] == 0:"), `Scan interior (${r}, ${c})`, { phase: "count" });
      if (grid[r][c] !== 0) continue;
      count++; island++; work = [[r, c]]; mutate(r, c, 1, island);
      snapshot(setLine("count += 1"), `Closed island #${island}`, { phase: "count" });
      snapshot(setLine("queue = deque([(r, c)])"), `Start island BFS at (${r}, ${c})`, { phase: "count" });
      while (work.length) {
        const [cr, cc] = work.shift(); current = [cr, cc];
        snapshot(setLine("cr, cc = queue.popleft()"), `Visit (${cr}, ${cc})`, { phase: "count" });
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc; current = [nr, nc];
          snapshot(setLine("nr, nc = cr + dr, cc + dc"), `Inspect (${nr}, ${nc})`, { phase: "count" });
          if (nr < 1 || nr >= rows - 1 || nc < 1 || nc >= cols - 1 || grid[nr][nc] !== 0) continue;
          mutate(nr, nc, 1, island); work.push([nr, nc]);
          snapshot(setLine("queue.append((nr, nc))"), `Add (${nr}, ${nc}) to island #${island}`, { phase: "count" });
        }
      }
    }
    snapshot(setLine("return count"), `Found ${count} closed islands`, { phase: "count", final: true });
    return { original, answer: count, steps };
  }

  if (approach === 3 || approach === 4) {
    const queueMode = approach === 4, workName = queueMode ? "queue" : "stack";
    snapshot(setLine("visited = [[False] * cols for _ in range(rows)]"), "Initialize visited matrix");
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      current = [r, c];
      snapshot(setLine("if grid[r][c] == 0 and not visited[r][c]:"), `Scan (${r}, ${c})`);
      if (grid[r][c] !== 0 || visited[r][c]) continue;
      island++; let touchesBorder = false, islandCells = [];
      work = [[r, c]]; visited[r][c] = true;
      snapshot(setLine(`                    ${workName} = ${queueMode ? "deque([(r, c)])" : "[(r, c)]"}`), `Start ${workName} for component #${island}`);
      snapshot(setLine("visited[r][c] = True"), `Mark (${r}, ${c}) visited`);
      snapshot(setLine("touches_border = False"), `Assume component #${island} is closed`);
      while (work.length) {
        const [cr, cc] = queueMode ? work.shift() : work.pop(); current = [cr, cc]; islandCells.push([cr, cc]);
        snapshot(setLine(`cr, cc = ${workName}.${queueMode ? "popleft" : "pop"}()`), `${workName} takes (${cr}, ${cc})`);
        const edge = cr === 0 || cr === rows - 1 || cc === 0 || cc === cols - 1;
        snapshot(setLine("if cr == 0 or cr == rows - 1 or cc == 0 or cc == cols - 1:"), edge ? `Component #${island} touches the border` : `(${cr}, ${cc}) is inside the border`);
        if (edge) touchesBorder = true;
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc; current = [nr, nc];
          snapshot(setLine("nr, nc = cr + dr, cc + dc"), `Inspect (${nr}, ${nc})`);
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] !== 0 || visited[nr][nc]) continue;
          visited[nr][nc] = true; work.push([nr, nc]);
          snapshot(setLine("visited[nr][nc] = True"), `Mark (${nr}, ${nc}) visited`);
        }
      }
      for (const [ir, ic] of islandCells) {
        consumed[ir][ic] = true;
        if (!touchesBorder) islandId[ir][ic] = island;
      }
      if (!touchesBorder) {
        count++;
        snapshot(setLine("count += 1"), `Count closed island #${island}`, { phase: "count" });
      } else {
        snapshot(setLine("touches_border = True"), `Discard border island #${island}`);
      }
    }
    snapshot(setLine("return count"), `Found ${count} closed islands`, { phase: "count", final: true });
    return { original, answer: count, steps };
  }

  const unionLine = needle => sourceLine(needle);
  snapshot(unionLine("parent = list(range(ocean + 1))"), "Initialize one set per cell and the virtual ocean");
  function unite(a, b) {
    const rootA = find(a), rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    current = [r, c]; snapshot(unionLine("if grid[r][c] != 0:"), `Scan (${r}, ${c})`);
    if (grid[r][c] !== 0) continue;
    const cell = r * cols + c;
    if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
      unite(cell, ocean);
      snapshot(unionLine("parent[find(cell)] = find(ocean)"), `Union border land (${r}, ${c}) with ocean`);
    }
    for (const [dr, dc] of [[1, 0], [0, 1]]) {
      const nr = r + dr, nc = c + dc; current = [nr, nc];
      snapshot(unionLine("nr, nc = r + dr, c + dc"), `Check neighbor (${nr}, ${nc})`);
      if (nr >= rows || nc >= cols || grid[nr][nc] !== 0) continue;
      unite(nr * cols + nc, cell);
      snapshot(unionLine("parent[find(nr * cols + nc)] = find(cell)"), `Union adjacent land (${nr}, ${nc})`);
    }
  }
  const oceanRoot = find(ocean), groups = new Map();
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (original[r][c] === 0) {
    const root = find(r * cols + c);
    if (root === oceanRoot) { consumed[r][c] = true; continue; }
    if (!groups.has(root)) groups.set(root, groups.size + 1);
    islandId[r][c] = groups.get(root);
    consumed[r][c] = true;
  }
  count = groups.size;
  snapshot(unionLine("return len(roots)"), `Found ${count} closed islands`, { phase: "count", final: true });
  return { original, answer: count, steps };
}

module.exports = {
  1254: {
    ...base,
    code: APPROACHES[0],
    code2: BORDER_BFS,
    code3: DFS_COMPONENTS,
    code4: BFS_COMPONENTS,
    code5: UNION_FIND,
    extraParams: [{
      key: "approach", label: bi("Cách giải", "Approach"), type: "select", default: "1",
      options: LABELS.map(([vi, en], index) => ({ value: String(index + 1), label: bi(`Cách ${index + 1}: ${vi}`, `Approach ${index + 1}: ${en}`) })),
    }],
    approach: LABELS.map(([vi, en]) => bi(vi, en)),
    codeLabel: bi(`Cách 1: ${LABELS[0][0]}`, `Approach 1: ${LABELS[0][1]}`),
    ...Object.fromEntries(LABELS.slice(1).map(([vi, en], index) => [`code${index + 2}Label`, bi(`Cách ${index + 2}: ${vi}`, `Approach ${index + 2}: ${en}`)])),
    builder: (input, params = {}) => build(input, Math.max(1, Math.min(5, Number(params.approach) || 1))),
    builder2: input => build(input, 2),
    builder3: input => build(input, 3),
    builder4: input => build(input, 4),
    builder5: input => build(input, 5),
  },
};
