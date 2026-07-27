// Detailed multi-source BFS visualizations shared by the Graph catalog.

function text(vi, en) {
  return { vi, en };
}

function parseGrid(input, allowed) {
  const rows = String(input)
    .split("|")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => (row.includes(",") ? row.split(",") : row.split(""))
      .map((value) => value.trim().replace(/^"|"$/g, "")));
  const valid = rows.length > 0 && rows[0].length > 0 && rows.every((row) =>
    row.length === rows[0].length && row.every((value) => allowed.has(value))
  );
  return { grid: rows, valid };
}

function parseNonnegativeGrid(input) {
  const rows = String(input)
    .split("|")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((value) => value.trim()));
  const valid = rows.length > 0 && rows[0].length > 0 && rows.every((row) =>
    row.length === rows[0].length && row.every((value) => /^\d+$/.test(value))
  );
  return { grid: rows, valid };
}

function invalidResult(grid, note) {
  return {
    original: grid,
    answer: [],
    steps: [{
      title: text("Đầu vào không hợp lệ", "Invalid input"),
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      highlight: [],
      mark: [],
      final: true,
      codeLines: [5],
      vars: [{ name: "answer", value: "invalid grid" }],
      note,
    }],
  };
}

function queueText(queue) {
  if (queue === null) return "not initialized";
  return `[${queue.map((item) => item.length > 2
    ? `(${item[0]},${item[1]},d=${item[2]})`
    : `(${item[0]},${item[1]})`).join(", ")}]`;
}

function createRecorder(rows, cols, getCells, getQueue) {
  const steps = [];
  function push(codeLine, title, note, options = {}) {
    const vars = [...(options.vars || [])];
    if (!vars.some((item) => item.name === "queue")) {
      vars.push({ name: "queue", value: queueText(getQueue()) });
    }
    steps.push({
      title,
      arr: [],
      bfsGrid: {
        rows,
        cols,
        cells: getCells(options.current || null, options.discovered || null, options.frontier || null),
      },
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: [codeLine],
      vars,
      note,
    });
  }
  return { steps, push };
}

function buildDistanceProblem(input, config) {
  const parsed = parseGrid(input, config.allowed);
  const original = parsed.grid.map((row) => row.map(config.toValue));
  if (!parsed.valid) return invalidResult(original, config.invalidNote);

  const grid = original.map((row) => [...row]);
  const rows = grid.length;
  const cols = grid[0].length;
  const values = config.initialValues(grid);
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let queue = null;
  let sourceCount = 0;
  let targetCount = 0;
  const key = (row, col) => `${row},${col}`;

  function cells(current, discovered) {
    const queued = new Set((queue || []).map(([row, col]) => key(row, col)));
    return grid.map((matrixRow, row) => matrixRow.map((inputValue, col) => {
      const value = values[row][col];
      let { label, cls } = config.cell(inputValue, value);
      if (queued.has(key(row, col))) cls = "queued";
      if (discovered && discovered[0] === row && discovered[1] === col) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label, cls };
    }));
  }

  const recorder = createRecorder(rows, cols, cells, () => queue);
  const { steps, push } = recorder;

  push(5, config.enterTitle, text("Bắt đầu hàm với grid đầu vào.", "Enter the function with the input grid."), {
    vars: [{ name: "grid size", value: `${rows}×${cols}` }],
  });
  push(6, text(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), text("Lưu số hàng và số cột.", "Store the row and column counts."), {
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
  });
  push(7, config.initTitle, config.initNote, {
    vars: [{ name: config.valueName, value: config.initialDebug }],
  });
  queue = [];
  push(8, text("queue = deque()", "queue = deque()"), text("Tạo queue rỗng cho multi-source BFS.", "Create an empty queue for multi-source BFS."));

  for (let row = 0; row < rows; row++) {
    push(9, text(`Quét row = ${row}`, `Scan row = ${row}`), text(`Bắt đầu quét hàng ${row}.`, `Begin scanning row ${row}.`), {
      vars: [{ name: "row", value: row }],
    });
    for (let col = 0; col < cols; col++) {
      push(10, text(`Quét ô (${row},${col})`, `Scan cell (${row},${col})`), text("Xét một ô để tìm nguồn BFS.", "Inspect one cell for a BFS source."), {
        current: [row, col],
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: config.inputName, value: grid[row][col] }],
      });
      const source = config.isSource(grid[row][col]);
      if (config.isTarget(grid[row][col])) targetCount++;
      push(11, config.sourceCheckTitle(row, col, source), source ? config.sourceTrueNote : config.sourceFalseNote, {
        current: [row, col],
        vars: [{ name: "is source?", value: source }],
      });
      if (!source) continue;
      sourceCount++;
      values[row][col] = config.sourceValue;
      push(12, config.sourceAssignTitle(row, col), config.sourceAssignNote, {
        current: [row, col],
        vars: [{ name: config.valueName + "[row][col]", value: config.sourceValue }],
      });
      queue.push([row, col]);
      push(13, text(`queue.append((${row},${col}))`, `queue.append((${row},${col}))`), text("Thêm nguồn vào queue.", "Append the source to the queue."), {
        current: [row, col],
        vars: [{ name: "sources", value: sourceCount }],
      });
    }
  }

  const early = config.early(sourceCount, targetCount, values);
  push(14, config.earlyTitle(early), config.earlyNote(early), {
    vars: [{ name: "source_count", value: sourceCount }, { name: "target_count", value: targetCount }],
  });
  if (early.stop) {
    push(14, config.returnTitle(early.answer), config.returnNote(early.answer), {
      final: true,
      vars: [{ name: "answer", value: JSON.stringify(early.answer) }],
    });
    return { original, answer: early.answer, steps };
  }

  push(15, text("Khai báo 4 hướng", "Define four directions"), text("BFS di chuyển lên, xuống, trái và phải.", "BFS moves up, down, left, and right."), {
    vars: [{ name: "directions", value: "down, up, right, left" }],
  });

  while (queue.length) {
    push(16, text("while queue → True", "while queue → True"), text("Queue còn ô cần mở rộng.", "The queue still has a cell to expand."), {
      vars: [{ name: "condition", value: true }],
    });
    const [row, col] = queue.shift();
    push(17, text(`popleft → (${row},${col})`, `popleft → (${row},${col})`), text("Lấy ô ở đầu queue.", "Remove the front cell from the queue."), {
      current: [row, col],
      vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "current value", value: values[row][col] }],
    });
    for (const [deltaRow, deltaCol] of directions) {
      push(18, text(`Thử hướng (${deltaRow},${deltaCol})`, `Try direction (${deltaRow},${deltaCol})`), text("Xét một ô lân cận.", "Inspect one neighboring cell."), {
        current: [row, col],
        vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }],
      });
      const nextRow = row + deltaRow;
      const nextCol = col + deltaCol;
      push(19, text(`next = (${nextRow},${nextCol})`, `next = (${nextRow},${nextCol})`), text("Tính tọa độ ô kế tiếp.", "Compute the neighboring coordinates."), {
        current: [row, col],
        vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
      });
      const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
      const canVisit = inBounds && config.canVisit(grid[nextRow][nextCol], values[nextRow][nextCol]);
      push(20, config.visitTitle(nextRow, nextCol, canVisit), canVisit ? config.visitTrueNote : config.visitFalseNote, {
        current: inBounds ? [nextRow, nextCol] : [row, col],
        vars: [{ name: "in bounds?", value: inBounds }, { name: "can visit?", value: canVisit }],
      });
      if (!canVisit) continue;
      values[nextRow][nextCol] = values[row][col] + 1;
      push(21, config.assignTitle(nextRow, nextCol, values[nextRow][nextCol]), config.assignNote, {
        current: [nextRow, nextCol],
        discovered: [nextRow, nextCol],
        vars: [{ name: "current value", value: values[row][col] }, { name: "new value", value: values[nextRow][nextCol] }],
      });
      queue.push([nextRow, nextCol]);
      push(22, text(`queue.append((${nextRow},${nextCol}))`, `queue.append((${nextRow},${nextCol}))`), text("Thêm ô vừa khám phá vào queue.", "Append the discovered cell to the queue."), {
        current: [nextRow, nextCol],
        discovered: [nextRow, nextCol],
      });
    }
  }

  push(16, text("while queue → False", "while queue → False"), text("Queue rỗng; BFS hoàn tất.", "The queue is empty; BFS is complete."), {
    vars: [{ name: "condition", value: false }],
  });
  const answer = config.answer(values);
  push(23, config.returnTitle(answer), config.returnNote(answer), {
    final: true,
    vars: [{ name: "answer", value: JSON.stringify(answer) }],
  });
  return { original, answer, steps };
}

function buildSteps1162(input) {
  return buildDistanceProblem(input, {
    allowed: new Set(["0", "1"]),
    toValue: Number,
    inputName: "grid[row][col]",
    valueName: "distance",
    enterTitle: text("Bắt đầu maxDistance", "Enter maxDistance"),
    initialValues: (grid) => grid.map((row) => row.map(() => -1)),
    initialDebug: "all -1 (shown as ∞)",
    initTitle: text("Khởi tạo distance = -1", "Initialize distance to -1"),
    initNote: text("-1 là ô biển chưa được BFS tới; visualization hiển thị ∞.", "-1 is undiscovered water; the visualization shows ∞."),
    isSource: (value) => value === 1,
    isTarget: (value) => value === 0,
    sourceValue: 0,
    sourceCheckTitle: (row, col, yes) => text(`grid[${row}][${col}] == 1 → ${yes}`, `grid[${row}][${col}] == 1 → ${yes}`),
    sourceTrueNote: text("Ô đất là một nguồn BFS.", "A land cell is a BFS source."),
    sourceFalseNote: text("Ô biển sẽ nhận khoảng cách từ nguồn đất gần nhất.", "A water cell will receive its distance from the nearest land source."),
    sourceAssignTitle: (row, col) => text(`distance[${row}][${col}] = 0`, `distance[${row}][${col}] = 0`),
    sourceAssignNote: text("Khoảng cách của đất tới đất gần nhất là 0.", "A land cell's distance to land is 0."),
    early: (sources, targets) => ({ stop: sources === 0 || targets === 0, answer: -1 }),
    earlyTitle: ({ stop }) => text(`Không có đất hoặc không có biển → ${stop}`, `No land or no water → ${stop}`),
    earlyNote: ({ stop }) => stop
      ? text("Đề yêu cầu cả đất và biển; trường hợp này trả -1.", "The problem needs both land and water; return -1.")
      : text("Có cả đất và biển nên tiếp tục BFS.", "Both land and water exist, so continue BFS."),
    canVisit: (_input, value) => value === -1,
    visitTitle: (row, col, yes) => text(`Ô (${row},${col}) là biển chưa thăm → ${yes}`, `Cell (${row},${col}) is unvisited water → ${yes}`),
    visitTrueNote: text("Lần đầu tới ô biển này cho khoảng cách ngắn nhất.", "The first visit to this water cell gives its shortest distance."),
    visitFalseNote: text("Ô ngoài biên hoặc đã có khoảng cách; bỏ qua.", "The cell is out of bounds or already has a distance; skip it."),
    assignTitle: (row, col, value) => text(`distance(${row},${col}) = ${value}`, `distance(${row},${col}) = ${value}`),
    assignNote: text("Khoảng cách mới bằng khoảng cách ô hiện tại cộng 1.", "The new distance is the current distance plus 1."),
    answer: (values) => Math.max(...values.flat()),
    returnTitle: (answer) => text(`return ${JSON.stringify(answer)}`, `return ${JSON.stringify(answer)}`),
    returnNote: (answer) => text(`Khoảng cách xa nhất từ biển tới đất là ${answer}.`, `The farthest water-to-land distance is ${answer}.`),
    cell: (input, value) => ({ label: input === 1 && value === 0 ? "L" : value === -1 ? "∞" : String(value), cls: value === -1 ? "empty" : "visited" }),
    invalidNote: text("Grid phải là ma trận chữ nhật chỉ gồm 0 và 1.", "The grid must be rectangular and contain only 0 and 1."),
  });
}

function buildSteps1765(input) {
  return buildDistanceProblem(input, {
    allowed: new Set(["0", "1"]),
    toValue: Number,
    inputName: "isWater[row][col]",
    valueName: "height",
    enterTitle: text("Bắt đầu highestPeak", "Enter highestPeak"),
    initialValues: (grid) => grid.map((row) => row.map(() => -1)),
    initialDebug: "all -1 (shown as ∞)",
    initTitle: text("Khởi tạo height = -1", "Initialize height to -1"),
    initNote: text("-1 là ô chưa được gán độ cao; visualization hiển thị ∞.", "-1 is an unassigned height; the visualization shows ∞."),
    isSource: (value) => value === 1,
    isTarget: (value) => value === 0,
    sourceValue: 0,
    sourceCheckTitle: (row, col, yes) => text(`isWater[${row}][${col}] == 1 → ${yes}`, `isWater[${row}][${col}] == 1 → ${yes}`),
    sourceTrueNote: text("Ô nước phải có độ cao 0 và là nguồn BFS.", "A water cell must have height 0 and is a BFS source."),
    sourceFalseNote: text("Ô đất sẽ được gán độ cao khi BFS lan tới.", "A land cell receives its height when BFS reaches it."),
    sourceAssignTitle: (row, col) => text(`height[${row}][${col}] = 0`, `height[${row}][${col}] = 0`),
    sourceAssignNote: text("Theo đề bài, mọi ô nước có độ cao 0.", "Every water cell has height 0."),
    early: (sources) => ({ stop: sources === 0, answer: [] }),
    earlyTitle: ({ stop }) => text(`Không có ô nước → ${stop}`, `No water source → ${stop}`),
    earlyNote: ({ stop }) => stop
      ? text("Input ngoài constraint vì không có ô nước.", "The input violates the constraint because it has no water cell.")
      : text("Đã có ít nhất một nguồn nước; tiếp tục BFS.", "At least one water source exists; continue BFS."),
    canVisit: (_input, value) => value === -1,
    visitTitle: (row, col, yes) => text(`Ô (${row},${col}) chưa có height → ${yes}`, `Cell (${row},${col}) has no height → ${yes}`),
    visitTrueNote: text("Lần đầu tới ô này cho độ cao nhỏ nhất hợp lệ từ nước.", "The first visit gives the minimum valid height from water."),
    visitFalseNote: text("Ô ngoài biên hoặc đã được gán height; bỏ qua.", "The cell is out of bounds or already has a height; skip it."),
    assignTitle: (row, col, value) => text(`height(${row},${col}) = ${value}`, `height(${row},${col}) = ${value}`),
    assignNote: text("Height mới bằng height ô hiện tại cộng 1.", "The new height is the current height plus 1."),
    answer: (values) => values.map((row) => [...row]),
    returnTitle: () => text("return height", "return height"),
    returnNote: () => text("Trả về bản đồ độ cao hoàn chỉnh.", "Return the completed height map."),
    cell: (_input, value) => ({ label: value === -1 ? "∞" : String(value), cls: value === -1 ? "empty" : "visited" }),
    invalidNote: text("isWater phải là ma trận chữ nhật chỉ gồm 0 và 1.", "isWater must be rectangular and contain only 0 and 1."),
  });
}

const INF = 2147483647;

function buildSteps286(input) {
  return buildDistanceProblem(input, {
    allowed: new Set(["-1", "0", String(INF)]),
    toValue: Number,
    inputName: "rooms[row][col]",
    valueName: "rooms",
    enterTitle: text("Bắt đầu wallsAndGates", "Enter wallsAndGates"),
    initialValues: (grid) => grid.map((row) => [...row]),
    initialDebug: "INF = 2147483647",
    initTitle: text("INF = 2147483647", "INF = 2147483647"),
    initNote: text("INF là phòng trống, -1 là tường và 0 là gate; rooms tự lưu distance.", "INF is an empty room, -1 is a wall, and 0 is a gate; rooms stores distances in place."),
    isSource: (value) => value === 0,
    isTarget: (value) => value === INF,
    sourceValue: 0,
    sourceCheckTitle: (row, col, yes) => text(`rooms[${row}][${col}] == 0 → ${yes}`, `rooms[${row}][${col}] == 0 → ${yes}`),
    sourceTrueNote: text("Gate là một nguồn BFS.", "A gate is a BFS source."),
    sourceFalseNote: text("Không phải gate; không enqueue ở bước khởi tạo.", "This is not a gate; do not enqueue it initially."),
    sourceAssignTitle: (row, col) => text(`rooms[${row}][${col}] = 0`, `rooms[${row}][${col}] = 0`),
    sourceAssignNote: text("Khoảng cách từ gate tới chính nó là 0.", "A gate's distance to itself is 0."),
    early: (sources, _targets, values) => ({ stop: sources === 0, answer: sources === 0 ? values.map((row) => [...row]) : null }),
    earlyTitle: ({ stop }) => text(`Không có gate → ${stop}`, `No gate → ${stop}`),
    earlyNote: ({ stop }) => stop
      ? text("Không có nguồn BFS nên rooms giữ nguyên.", "There is no BFS source, so rooms stays unchanged.")
      : text("Có gate; bắt đầu lan khoảng cách.", "At least one gate exists; begin spreading distances."),
    canVisit: (inputValue, value) => inputValue === INF && value === INF,
    visitTitle: (row, col, yes) => text(`Ô (${row},${col}) là phòng INF → ${yes}`, `Cell (${row},${col}) is an INF room → ${yes}`),
    visitTrueNote: text("Đây là phòng trống chưa được thăm.", "This is an unvisited empty room."),
    visitFalseNote: text("Ô ngoài biên, là tường/gate, hoặc đã có khoảng cách; bỏ qua.", "The cell is out of bounds, a wall/gate, or already assigned; skip it."),
    assignTitle: (row, col, value) => text(`rooms[${row}][${col}] = ${value}`, `rooms[${row}][${col}] = ${value}`),
    assignNote: text("Khoảng cách phòng bằng khoảng cách ô hiện tại cộng 1.", "The room distance is the current distance plus 1."),
    answer: (values) => values.map((row) => [...row]),
    returnTitle: () => text("return rooms", "return rooms"),
    returnNote: () => text("Trả về rooms sau khi điền khoảng cách gate gần nhất.", "Return rooms filled with nearest-gate distances."),
    cell: (input, value) => {
      if (input === -1) return { label: "X", cls: "wall" };
      if (input === 0) return { label: "G", cls: "visited" };
      return { label: value === INF ? "∞" : String(value), cls: value === INF ? "empty" : "visited" };
    },
    invalidNote: text("Rooms chỉ được chứa -1, 0 hoặc 2147483647.", "Rooms may contain only -1, 0, or 2147483647."),
  });
}

function buildSteps934(input) {
  const parsed = parseGrid(input, new Set(["0", "1"]));
  const original = parsed.grid.map((row) => row.map(Number));
  if (!parsed.valid) return invalidResult(original, text("Grid phải là ma trận chữ nhật chỉ gồm 0 và 1.", "The grid must be rectangular and contain only 0 and 1."));
  const grid = original.map((row) => [...row]);
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const visited = new Set();
  const firstIsland = new Set();
  const waterDistance = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const key = (row, col) => `${row},${col}`;
  let queue = [];

  function cells(current, discovered, frontier) {
    const queued = new Set(queue.map(([row, col]) => key(row, col)));
    const frontierSet = new Set((frontier || []).map(([row, col]) => key(row, col)));
    return grid.map((matrixRow, row) => matrixRow.map((value, col) => {
      const cellKey = key(row, col);
      let label = value === 1 ? "B" : waterDistance[row][col] >= 0 ? String(waterDistance[row][col]) : "";
      let cls = value === 1 ? "empty" : "wall";
      if (firstIsland.has(cellKey)) { label = "A"; cls = "path"; }
      else if (waterDistance[row][col] >= 0) cls = "visited";
      if (frontierSet.has(cellKey)) cls = "queued";
      if (queued.has(cellKey)) cls = "queued";
      if (discovered && discovered[0] === row && discovered[1] === col) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label, cls };
    }));
  }

  const { steps, push } = createRecorder(rows, cols, cells, () => queue);
  push(5, text("Bắt đầu shortestBridge", "Enter shortestBridge"), text("Cần tìm đảo thứ nhất rồi mở rộng BFS tới đảo thứ hai.", "Find the first island, then expand BFS until reaching the second."), { vars: [{ name: "grid size", value: `${rows}×${cols}` }] });
  push(6, text(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), text("Lưu kích thước grid.", "Store the grid dimensions."), { vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }] });
  push(7, text("Khai báo 4 hướng", "Define four directions"), text("DFS và BFS đều dùng bốn hướng.", "Both DFS and BFS use four directions."), { vars: [{ name: "directions", value: "down, up, right, left" }] });
  push(8, text("queue = deque()", "queue = deque()"), text("Queue sẽ chứa toàn bộ đảo thứ nhất như các nguồn BFS.", "The queue will contain the entire first island as BFS sources."));
  push(9, text("visited = set()", "visited = set()"), text("Visited ngăn DFS/BFS xử lý trùng ô.", "Visited prevents duplicate DFS/BFS processing."), { vars: [{ name: "visited", value: 0 }] });
  push(10, text("Định nghĩa mark_first_island", "Define mark_first_island"), text("Helper DFS đánh dấu toàn bộ đảo đầu tiên.", "The DFS helper marks the whole first island."));

  let found = false;
  push(19, text("found = False", "found = False"), text("Cờ này dừng scan ngay sau khi tìm thấy đảo đầu tiên.", "This flag stops the scan after the first island is found."), { vars: [{ name: "found", value: false }] });
  for (let scanRow = 0; scanRow < rows && !found; scanRow++) {
    push(20, text(`Quét row = ${scanRow}`, `Scan row = ${scanRow}`), text("Tìm ô đất đầu tiên.", "Search for the first land cell."), { vars: [{ name: "row", value: scanRow }] });
    for (let scanCol = 0; scanCol < cols; scanCol++) {
      push(21, text(`Quét ô (${scanRow},${scanCol})`, `Scan cell (${scanRow},${scanCol})`), text("Kiểm tra ô hiện tại.", "Inspect the current cell."), { current: [scanRow, scanCol], vars: [{ name: "col", value: scanCol }, { name: "grid[row][col]", value: grid[scanRow][scanCol] }] });
      const isLand = grid[scanRow][scanCol] === 1;
      push(22, text(`grid[${scanRow}][${scanCol}] == 1 → ${isLand}`, `grid[${scanRow}][${scanCol}] == 1 → ${isLand}`), isLand ? text("Đã tìm thấy đảo đầu tiên.", "The first island has been found.") : text("Đây là nước; tiếp tục quét.", "This is water; continue scanning."), { current: [scanRow, scanCol], vars: [{ name: "is land?", value: isLand }] });
      if (!isLand) continue;
      push(23, text(`mark_first_island(${scanRow},${scanCol})`, `mark_first_island(${scanRow},${scanCol})`), text("Bắt đầu DFS từ ô đất đầu tiên.", "Start DFS from the first land cell."), { current: [scanRow, scanCol] });
      const stack = [[scanRow, scanCol]];
      push(11, text(`stack = [(${scanRow},${scanCol})]`, `stack = [(${scanRow},${scanCol})]`), text("Đặt ô bắt đầu vào DFS stack.", "Put the starting cell on the DFS stack."), { current: [scanRow, scanCol], vars: [{ name: "stack", value: JSON.stringify(stack) }] });
      while (stack.length) {
        push(12, text("while stack → True", "while stack → True"), text("DFS stack còn ô cần xử lý.", "The DFS stack still has a cell."), { vars: [{ name: "stack", value: JSON.stringify(stack) }] });
        const [row, col] = stack.pop();
        push(13, text(`stack.pop() → (${row},${col})`, `stack.pop() → (${row},${col})`), text("Lấy một ô khỏi DFS stack.", "Pop one cell from the DFS stack."), { current: row >= 0 && row < rows && col >= 0 && col < cols ? [row, col] : null, vars: [{ name: "row", value: row }, { name: "col", value: col }] });
        const validLand = row >= 0 && row < rows && col >= 0 && col < cols && grid[row][col] === 1 && !visited.has(key(row, col));
        push(14, text(`Ô (${row},${col}) là đất chưa thăm → ${validLand}`, `Cell (${row},${col}) is unvisited land → ${validLand}`), validLand ? text("Đưa ô này vào đảo A.", "Add this cell to island A.") : text("Ô không hợp lệ hoặc đã thăm; continue.", "The cell is invalid or visited; continue."), { current: row >= 0 && row < rows && col >= 0 && col < cols ? [row, col] : null, vars: [{ name: "valid land?", value: validLand }] });
        if (!validLand) continue;
        visited.add(key(row, col));
        firstIsland.add(key(row, col));
        push(15, text(`visited.add((${row},${col}))`, `visited.add((${row},${col}))`), text("Đánh dấu ô thuộc đảo đầu tiên.", "Mark the cell as part of the first island."), { current: [row, col], vars: [{ name: "island A size", value: firstIsland.size }] });
        waterDistance[row][col] = 0;
        queue.push([row, col, 0]);
        push(16, text(`queue.append((${row},${col},0))`, `queue.append((${row},${col},0))`), text("Mỗi ô đảo A là một nguồn BFS distance 0.", "Every island-A cell is a BFS source at distance 0."), { current: [row, col] });
        for (const [deltaRow, deltaCol] of directions) {
          push(17, text(`DFS thử hướng (${deltaRow},${deltaCol})`, `DFS tries direction (${deltaRow},${deltaCol})`), text("Chuẩn bị thêm ô lân cận vào stack.", "Prepare to add a neighbor to the stack."), { current: [row, col], vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }] });
          stack.push([row + deltaRow, col + deltaCol]);
          push(18, text("stack.append(neighbor)", "stack.append(neighbor)"), text("DFS sẽ kiểm tra neighbor ở bước sau.", "DFS will inspect this neighbor later."), { current: [row, col], vars: [{ name: "stack", value: JSON.stringify(stack) }] });
        }
      }
      push(12, text("while stack → False", "while stack → False"), text("Đã đánh dấu xong đảo đầu tiên.", "The first island is fully marked."), { vars: [{ name: "island A size", value: firstIsland.size }] });
      found = true;
      push(24, text("found = True", "found = True"), text("Đặt cờ để dừng quét grid.", "Set the flag to stop scanning the grid."));
      push(25, text("break", "break"), text("Thoát vòng lặp cột.", "Break out of the column loop."));
    }
    if (found) push(26, text("if found: break", "if found: break"), text("Thoát vòng lặp hàng sau khi đã có đảo A.", "Break the row loop after finding island A."));
  }

  while (queue.length) {
    push(27, text("while queue → True", "while queue → True"), text("Mở rộng đồng thời từ toàn bộ đảo A.", "Expand simultaneously from the entire island A."));
    const [row, col, distance] = queue.shift();
    push(28, text(`popleft → (${row},${col},d=${distance})`, `popleft → (${row},${col},d=${distance})`), text("Lấy một frontier cell khỏi queue.", "Remove one frontier cell from the queue."), { current: [row, col], vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "distance", value: distance }] });
    for (const [deltaRow, deltaCol] of directions) {
      push(29, text(`BFS thử hướng (${deltaRow},${deltaCol})`, `BFS tries direction (${deltaRow},${deltaCol})`), text("Xét một neighbor của frontier.", "Inspect one frontier neighbor."), { current: [row, col], vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }] });
      const nextRow = row + deltaRow;
      const nextCol = col + deltaCol;
      push(30, text(`next = (${nextRow},${nextCol})`, `next = (${nextRow},${nextCol})`), text("Tính tọa độ neighbor.", "Compute the neighbor coordinates."), { current: [row, col], vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }] });
      const canInspect = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols && !visited.has(key(nextRow, nextCol));
      push(31, text(`Neighbor hợp lệ và chưa thăm → ${canInspect}`, `Neighbor is valid and unvisited → ${canInspect}`), canInspect ? text("Có thể mở rộng vào ô này.", "BFS may expand into this cell.") : text("Ngoài biên hoặc đã thăm; continue.", "Out of bounds or visited; continue."), { current: canInspect ? [nextRow, nextCol] : [row, col], vars: [{ name: "can inspect?", value: canInspect }] });
      if (!canInspect) continue;
      const reachedSecond = grid[nextRow][nextCol] === 1;
      push(32, text(`grid[${nextRow}][${nextCol}] == 1 → ${reachedSecond}`, `grid[${nextRow}][${nextCol}] == 1 → ${reachedSecond}`), reachedSecond ? text("Đã chạm đảo B; distance là số ô nước cần lật.", "Island B is reached; distance is the number of water cells to flip.") : text("Đây là nước; tiếp tục mở rộng.", "This is water; continue expanding."), { current: [nextRow, nextCol], vars: [{ name: "reached island B?", value: reachedSecond }] });
      if (reachedSecond) {
        push(33, text(`return ${distance}`, `return ${distance}`), text(`Cầu ngắn nhất cần lật ${distance} ô nước.`, `The shortest bridge flips ${distance} water cell(s).`), { current: [nextRow, nextCol], final: true, vars: [{ name: "answer", value: distance }] });
        return { original, answer: distance, steps };
      }
      visited.add(key(nextRow, nextCol));
      waterDistance[nextRow][nextCol] = distance + 1;
      push(34, text(`visited.add((${nextRow},${nextCol}))`, `visited.add((${nextRow},${nextCol}))`), text("Đánh dấu ô nước để không enqueue trùng.", "Mark the water cell to avoid duplicate enqueue."), { current: [nextRow, nextCol], discovered: [nextRow, nextCol], vars: [{ name: "new distance", value: distance + 1 }] });
      queue.push([nextRow, nextCol, distance + 1]);
      push(35, text(`queue.append((${nextRow},${nextCol},${distance + 1}))`, `queue.append((${nextRow},${nextCol},${distance + 1}))`), text("Thêm water frontier mới vào queue.", "Append the new water frontier to the queue."), { current: [nextRow, nextCol], discovered: [nextRow, nextCol] });
    }
  }
  push(36, text("return -1", "return -1"), text("Không tìm thấy đảo thứ hai.", "No second island was found."), { final: true, vars: [{ name: "answer", value: -1 }] });
  return { original, answer: -1, steps };
}

function buildSteps417(input) {
  const parsed = parseNonnegativeGrid(input);
  const original = parsed.grid.map((row) => row.map(Number));
  if (!parsed.valid) return invalidResult(original, text("Heights phải là ma trận chữ nhật gồm số nguyên không âm.", "Heights must be a rectangular matrix of nonnegative integers."));
  const heights = original.map((row) => [...row]);
  const rows = heights.length;
  const cols = heights[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (row, col) => `${row},${col}`;
  let queue = null;
  let pacific = new Set();
  let atlantic = new Set();
  let active = null;

  function cells(current, discovered, frontier) {
    const queued = new Set((queue || []).map(([row, col]) => key(row, col)));
    const frontierSet = new Set((frontier || []).map(([row, col]) => key(row, col)));
    return heights.map((matrixRow, row) => matrixRow.map((height, col) => {
      const cellKey = key(row, col);
      const p = pacific.has(cellKey);
      const a = atlantic.has(cellKey);
      let cls = p && a ? "path" : p || a ? "visited" : "empty";
      let label = p && a ? `${height}·B` : p ? `${height}·P` : a ? `${height}·A` : String(height);
      if (frontierSet.has(cellKey) || queued.has(cellKey)) cls = "queued";
      if (discovered && discovered[0] === row && discovered[1] === col) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label, cls };
    }));
  }

  const { steps, push } = createRecorder(rows, cols, cells, () => queue);
  push(5, text("Bắt đầu pacificAtlantic", "Enter pacificAtlantic"), text("Chạy reverse-flow BFS riêng từ hai đại dương.", "Run separate reverse-flow BFS searches from both oceans."), { vars: [{ name: "grid size", value: `${rows}×${cols}` }] });
  push(6, text(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), text("Lưu kích thước heights.", "Store the heights dimensions."), { vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }] });
  push(7, text("Khai báo 4 hướng", "Define four directions"), text("Nước kết nối theo bốn hướng.", "Water connects in four directions."), { vars: [{ name: "directions", value: "down, up, right, left" }] });
  push(8, text("Định nghĩa bfs(starts)", "Define bfs(starts)"), text("BFS đi ngược dòng: từ biển sang ô có height lớn hơn hoặc bằng.", "BFS flows in reverse: from an ocean toward equal-or-higher cells."));

  const pacificStarts = [];
  const atlanticStarts = [];
  const addUnique = (array, seen, row, col) => {
    const cellKey = key(row, col);
    if (!seen.has(cellKey)) { seen.add(cellKey); array.push([row, col]); }
  };
  const pacificStartSet = new Set();
  const atlanticStartSet = new Set();
  for (let col = 0; col < cols; col++) {
    addUnique(pacificStarts, pacificStartSet, 0, col);
    addUnique(atlanticStarts, atlanticStartSet, rows - 1, col);
  }
  for (let row = 0; row < rows; row++) {
    addUnique(pacificStarts, pacificStartSet, row, 0);
    addUnique(atlanticStarts, atlanticStartSet, row, cols - 1);
  }
  push(20, text(`Pacific starts = ${pacificStarts.length} ô`, `Pacific starts = ${pacificStarts.length} cells`), text("Pacific chạm biên trên và biên trái.", "The Pacific touches the top and left borders."), { frontier: pacificStarts, vars: [{ name: "pacific_starts", value: queueText(pacificStarts) }] });
  push(21, text(`Atlantic starts = ${atlanticStarts.length} ô`, `Atlantic starts = ${atlanticStarts.length} cells`), text("Atlantic chạm biên dưới và biên phải.", "The Atlantic touches the bottom and right borders."), { frontier: atlanticStarts, vars: [{ name: "atlantic_starts", value: queueText(atlanticStarts) }] });

  function runOcean(starts, oceanName, reachable, callLine) {
    active = oceanName;
    queue = null;
    push(callLine, text(`bfs(${oceanName})`, `bfs(${oceanName})`), text(`Bắt đầu BFS ngược từ toàn bộ biên ${oceanName}.`, `Start reverse BFS from the entire ${oceanName} border.`), { frontier: starts, vars: [{ name: "ocean", value: oceanName }] });
    reachable.clear();
    for (const [row, col] of starts) reachable.add(key(row, col));
    push(9, text(`reachable = set(${oceanName}_starts)`, `reachable = set(${oceanName}_starts)`), text("Mọi ô biên của đại dương đều reachable ban đầu.", "Every ocean-border cell is initially reachable."), { frontier: starts, vars: [{ name: "reachable", value: reachable.size }] });
    queue = starts.map((cell) => [...cell]);
    push(10, text("queue = deque(starts)", "queue = deque(starts)"), text("Đưa đồng thời toàn bộ nguồn biên vào queue.", "Put all border sources into the queue simultaneously."), { vars: [{ name: "ocean", value: oceanName }] });
    while (queue.length) {
      push(11, text("while queue → True", "while queue → True"), text(`Queue ${oceanName} còn ô cần mở rộng.`, `The ${oceanName} queue still has a cell.`));
      const [row, col] = queue.shift();
      push(12, text(`popleft → (${row},${col})`, `popleft → (${row},${col})`), text("Lấy một ô khỏi queue.", "Remove one cell from the queue."), { current: [row, col], vars: [{ name: "height", value: heights[row][col] }, { name: "ocean", value: oceanName }] });
      for (const [deltaRow, deltaCol] of directions) {
        push(13, text(`Thử hướng (${deltaRow},${deltaCol})`, `Try direction (${deltaRow},${deltaCol})`), text("Xét neighbor theo reverse flow.", "Inspect a neighbor under reverse flow."), { current: [row, col], vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }] });
        const nextRow = row + deltaRow;
        const nextCol = col + deltaCol;
        push(14, text(`next = (${nextRow},${nextCol})`, `next = (${nextRow},${nextCol})`), text("Tính tọa độ neighbor.", "Compute the neighbor coordinates."), { current: [row, col], vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }] });
        const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
        const newCell = inBounds && !reachable.has(key(nextRow, nextCol));
        push(15, text(`Hợp lệ và chưa reachable → ${newCell}`, `Valid and not reachable → ${newCell}`), newCell ? text("Tiếp tục kiểm tra điều kiện height.", "Continue to the height condition.") : text("Ngoài biên hoặc đã reachable; continue.", "Out of bounds or already reachable; continue."), { current: inBounds ? [nextRow, nextCol] : [row, col], vars: [{ name: "new cell?", value: newCell }] });
        if (!newCell) continue;
        const canReverseFlow = heights[nextRow][nextCol] >= heights[row][col];
        push(16, text(`${heights[nextRow][nextCol]} >= ${heights[row][col]} → ${canReverseFlow}`, `${heights[nextRow][nextCol]} >= ${heights[row][col]} → ${canReverseFlow}`), canReverseFlow ? text("Neighbor cao hơn/bằng nên có thể chảy xuôi về đại dương.", "The neighbor is equal/higher, so it can flow down to the ocean.") : text("Neighbor thấp hơn; reverse BFS không đi tới.", "The neighbor is lower; reverse BFS cannot enter it."), { current: [nextRow, nextCol], vars: [{ name: "can reverse flow?", value: canReverseFlow }] });
        if (!canReverseFlow) continue;
        reachable.add(key(nextRow, nextCol));
        push(17, text(`reachable.add((${nextRow},${nextCol}))`, `reachable.add((${nextRow},${nextCol}))`), text(`Đánh dấu ô có thể chảy tới ${oceanName}.`, `Mark the cell as able to flow to ${oceanName}.`), { current: [nextRow, nextCol], discovered: [nextRow, nextCol], vars: [{ name: "reachable", value: reachable.size }] });
        queue.push([nextRow, nextCol]);
        push(18, text(`queue.append((${nextRow},${nextCol}))`, `queue.append((${nextRow},${nextCol}))`), text("Thêm ô mới vào queue.", "Append the new cell to the queue."), { current: [nextRow, nextCol], discovered: [nextRow, nextCol] });
      }
    }
    push(11, text("while queue → False", "while queue → False"), text(`BFS ${oceanName} hoàn tất.`, `${oceanName} BFS is complete.`), { vars: [{ name: "reachable", value: reachable.size }] });
    push(19, text("return reachable", "return reachable"), text(`Trả về tập reachable của ${oceanName}.`, `Return the ${oceanName} reachable set.`), { vars: [{ name: "reachable", value: reachable.size }] });
  }

  runOcean(pacificStarts, "Pacific", pacific, 22);
  runOcean(atlanticStarts, "Atlantic", atlantic, 23);
  queue = [];
  active = null;
  const result = [];
  push(24, text("result = []", "result = []"), text("Chuẩn bị lấy giao của hai tập reachable.", "Prepare to intersect the two reachable sets."), { vars: [{ name: "Pacific", value: pacific.size }, { name: "Atlantic", value: atlantic.size }] });
  for (let row = 0; row < rows; row++) {
    push(25, text(`Quét result row = ${row}`, `Scan result row = ${row}`), text("Quét các ô theo thứ tự hàng.", "Scan cells in row order."), { vars: [{ name: "row", value: row }] });
    for (let col = 0; col < cols; col++) {
      push(26, text(`Quét result cell (${row},${col})`, `Scan result cell (${row},${col})`), text("Kiểm tra membership trong hai tập.", "Check membership in both sets."), { current: [row, col], vars: [{ name: "col", value: col }] });
      const both = pacific.has(key(row, col)) && atlantic.has(key(row, col));
      push(27, text(`Pacific AND Atlantic → ${both}`, `Pacific AND Atlantic → ${both}`), both ? text("Ô này chảy được tới cả hai đại dương.", "This cell can flow to both oceans.") : text("Ô không nằm trong giao; bỏ qua.", "The cell is not in the intersection; skip it."), { current: [row, col], vars: [{ name: "both oceans?", value: both }] });
      if (!both) continue;
      result.push([row, col]);
      push(28, text(`result.append([${row},${col}])`, `result.append([${row},${col}])`), text("Thêm tọa độ vào kết quả.", "Append the coordinate to the result."), { current: [row, col], discovered: [row, col], vars: [{ name: "result", value: JSON.stringify(result) }] });
    }
  }
  push(29, text("return result", "return result"), text("Trả về mọi ô chảy được tới cả Pacific và Atlantic.", "Return every cell that can flow to both Pacific and Atlantic."), { final: true, vars: [{ name: "answer", value: JSON.stringify(result) }] });
  return { original, answer: result, steps };
}

function buildBoundaryFlood(input, config) {
  const parsed = parseGrid(input, config.allowed);
  const original = parsed.grid.map((row) => row.map(config.toValue));
  if (!parsed.valid) return invalidResult(original, config.invalidNote);
  const grid = original.map((row) => [...row]);
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (row, col) => `${row},${col}`;
  let queue = [];

  function cells(current, discovered) {
    const queued = new Set(queue.map(([row, col]) => key(row, col)));
    return grid.map((matrixRow, row) => matrixRow.map((value, col) => {
      let { label, cls } = config.cell(value);
      if (queued.has(key(row, col))) cls = "queued";
      if (discovered && discovered[0] === row && discovered[1] === col) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label, cls };
    }));
  }

  const { steps, push } = createRecorder(rows, cols, cells, () => queue);
  push(5, config.enterTitle, config.enterNote, { vars: [{ name: "grid size", value: `${rows}×${cols}` }] });
  push(6, text(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), text("Lưu kích thước grid.", "Store the grid dimensions."), { vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }] });
  push(7, text("queue = deque()", "queue = deque()"), text("Queue chứa mọi nguồn nằm trên biên.", "The queue stores every boundary source."));
  push(8, text("Khai báo 4 hướng", "Define four directions"), text("BFS lan theo bốn hướng.", "BFS spreads in four directions."), { vars: [{ name: "directions", value: "down, up, right, left" }] });

  for (let row = 0; row < rows; row++) {
    push(9, text(`Quét row = ${row}`, `Scan row = ${row}`), text("Tìm source trên biên.", "Find boundary sources."), { vars: [{ name: "row", value: row }] });
    for (let col = 0; col < cols; col++) {
      push(10, text(`Quét ô (${row},${col})`, `Scan cell (${row},${col})`), text("Kiểm tra ô hiện tại.", "Inspect the current cell."), { current: [row, col], vars: [{ name: "col", value: col }, { name: config.cellName, value: grid[row][col] }] });
      const isBorder = row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
      const source = isBorder && config.isSource(grid[row][col]);
      push(11, config.boundaryTitle(row, col, source), source ? config.boundaryTrueNote : config.boundaryFalseNote, { current: [row, col], vars: [{ name: "is border?", value: isBorder }, { name: "is source?", value: source }] });
      if (!source) continue;
      grid[row][col] = config.markValue;
      push(12, config.markTitle(row, col), config.markNote, { current: [row, col], discovered: [row, col] });
      queue.push([row, col]);
      push(13, text(`queue.append((${row},${col}))`, `queue.append((${row},${col}))`), text("Thêm source biên vào queue.", "Append the boundary source to the queue."), { current: [row, col] });
    }
  }

  while (queue.length) {
    push(14, text("while queue → True", "while queue → True"), text("Queue còn source cần lan.", "The queue still has a source to expand."));
    const [row, col] = queue.shift();
    push(15, text(`popleft → (${row},${col})`, `popleft → (${row},${col})`), text("Lấy ô ở đầu queue.", "Remove the front cell from the queue."), { current: [row, col], vars: [{ name: "row", value: row }, { name: "col", value: col }] });
    for (const [deltaRow, deltaCol] of directions) {
      push(16, text(`Thử hướng (${deltaRow},${deltaCol})`, `Try direction (${deltaRow},${deltaCol})`), text("Xét một neighbor.", "Inspect one neighbor."), { current: [row, col], vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }] });
      const nextRow = row + deltaRow;
      const nextCol = col + deltaCol;
      push(17, text(`next = (${nextRow},${nextCol})`, `next = (${nextRow},${nextCol})`), text("Tính tọa độ neighbor.", "Compute the neighbor coordinates."), { current: [row, col], vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }] });
      const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
      const canVisit = inBounds && config.isSource(grid[nextRow][nextCol]);
      push(18, config.visitTitle(nextRow, nextCol, canVisit), canVisit ? config.visitTrueNote : config.visitFalseNote, { current: inBounds ? [nextRow, nextCol] : [row, col], vars: [{ name: "in bounds?", value: inBounds }, { name: "can visit?", value: canVisit }] });
      if (!canVisit) continue;
      grid[nextRow][nextCol] = config.markValue;
      push(19, config.markTitle(nextRow, nextCol), config.markNote, { current: [nextRow, nextCol], discovered: [nextRow, nextCol] });
      queue.push([nextRow, nextCol]);
      push(20, text(`queue.append((${nextRow},${nextCol}))`, `queue.append((${nextRow},${nextCol}))`), text("Thêm neighbor vừa đánh dấu vào queue.", "Append the newly marked neighbor to the queue."), { current: [nextRow, nextCol], discovered: [nextRow, nextCol] });
    }
  }
  push(14, text("while queue → False", "while queue → False"), text("Queue rỗng; mọi vùng nối biên đã được đánh dấu.", "The queue is empty; all boundary-connected regions are marked."));
  const answer = config.finish({ grid, rows, cols, push });
  return { original, answer, steps };
}

function buildSteps130Bfs(input) {
  return buildBoundaryFlood(input, {
    allowed: new Set(["X", "O"]),
    toValue: String,
    cellName: "board[row][col]",
    markValue: "S",
    enterTitle: text("Bắt đầu solve", "Enter solve"),
    enterNote: text("Đánh dấu mọi O nối với biên là safe, rồi bắt các O còn lại.", "Mark every border-connected O safe, then capture the remaining O cells."),
    isSource: (value) => value === "O",
    boundaryTitle: (row, col, yes) => text(`(${row},${col}) là border O → ${yes}`, `(${row},${col}) is a border O → ${yes}`),
    boundaryTrueNote: text("Đây là một nguồn safe của multi-source BFS.", "This is a safe source for multi-source BFS."),
    boundaryFalseNote: text("Không phải border O; bỏ qua ở phase khởi tạo.", "This is not a border O; skip it during initialization."),
    markTitle: (row, col) => text(`board[${row}][${col}] = 'S'`, `board[${row}][${col}] = 'S'`),
    markNote: text("Đánh dấu O nối biên là safe trước khi enqueue.", "Mark the border-connected O safe before enqueueing."),
    visitTitle: (row, col, yes) => text(`Neighbor (${row},${col}) là O → ${yes}`, `Neighbor (${row},${col}) is O → ${yes}`),
    visitTrueNote: text("O này nối với vùng biên nên cũng safe.", "This O connects to the boundary region, so it is also safe."),
    visitFalseNote: text("Ngoài biên hoặc không còn là O; bỏ qua.", "Out of bounds or no longer O; skip it."),
    cell: (value) => {
      if (value === "X") return { label: "X", cls: "wall" };
      if (value === "S") return { label: "O", cls: "path" };
      return { label: "O", cls: "empty" };
    },
    finish: ({ grid, rows, cols, push }) => {
      for (let row = 0; row < rows; row++) {
        push(21, text(`Final scan row = ${row}`, `Final scan row = ${row}`), text("Quét lại để capture hoặc restore.", "Scan again to capture or restore."), { vars: [{ name: "row", value: row }] });
        for (let col = 0; col < cols; col++) {
          push(22, text(`Final scan (${row},${col})`, `Final scan (${row},${col})`), text("Xét trạng thái cuối của ô.", "Inspect the cell's final state."), { current: [row, col], vars: [{ name: "col", value: col }, { name: "board[row][col]", value: grid[row][col] }] });
          if (grid[row][col] === "O") {
            grid[row][col] = "X";
            push(23, text(`Capture (${row},${col}): O → X`, `Capture (${row},${col}): O → X`), text("O không nối biên bị bao quanh nên đổi thành X.", "A non-border-connected O is surrounded, so flip it to X."), { current: [row, col] });
          } else if (grid[row][col] === "S") {
            grid[row][col] = "O";
            push(24, text(`Restore (${row},${col}): S → O`, `Restore (${row},${col}): S → O`), text("Khôi phục vùng safe về O.", "Restore the safe region to O."), { current: [row, col] });
          }
        }
      }
      const answer = grid.map((row) => [...row]);
      push(25, text("return board", "return board"), text("Trả về board sau khi capture.", "Return the captured board."), { final: true, vars: [{ name: "answer", value: answer.map((row) => row.join("")).join(" | ") }] });
      return answer;
    },
    invalidNote: text("Board phải là ma trận chữ nhật chỉ gồm X và O.", "The board must be rectangular and contain only X and O."),
  });
}

function buildSteps1020(input) {
  return buildBoundaryFlood(input, {
    allowed: new Set(["0", "1"]),
    toValue: Number,
    cellName: "grid[row][col]",
    markValue: 0,
    enterTitle: text("Bắt đầu numEnclaves", "Enter numEnclaves"),
    enterNote: text("Xóa đồng thời mọi vùng đất nối biên, rồi đếm phần đất còn lại.", "Remove every border-connected land region simultaneously, then count the remaining land."),
    isSource: (value) => value === 1,
    boundaryTitle: (row, col, yes) => text(`(${row},${col}) là border land → ${yes}`, `(${row},${col}) is border land → ${yes}`),
    boundaryTrueNote: text("Đất ở biên là nguồn BFS và không phải enclave.", "Border land is a BFS source and cannot be an enclave."),
    boundaryFalseNote: text("Không phải đất biên; bỏ qua ở phase khởi tạo.", "This is not border land; skip it during initialization."),
    markTitle: (row, col) => text(`grid[${row}][${col}] = 0`, `grid[${row}][${col}] = 0`),
    markNote: text("Xóa đất nối biên trước khi enqueue để tránh trùng.", "Remove border-connected land before enqueueing to prevent duplicates."),
    visitTitle: (row, col, yes) => text(`Neighbor (${row},${col}) là land → ${yes}`, `Neighbor (${row},${col}) is land → ${yes}`),
    visitTrueNote: text("Đất này nối tới biên nên không phải enclave.", "This land connects to the boundary, so it is not an enclave."),
    visitFalseNote: text("Ngoài biên hoặc là nước/đã xóa; bỏ qua.", "Out of bounds or water/already removed; skip it."),
    cell: (value) => value === 1 ? { label: "1", cls: "empty" } : { label: "", cls: "wall" },
    finish: ({ grid, push }) => {
      const answer = grid.flat().reduce((sum, value) => sum + value, 0);
      push(21, text(`enclaves = ${answer}`, `enclaves = ${answer}`), text("Cộng các ô đất còn lại sau boundary flood-fill.", "Sum the land cells remaining after boundary flood-fill."), { vars: [{ name: "enclaves", value: answer }] });
      push(22, text(`return ${answer}`, `return ${answer}`), text("Trả về số ô đất không thể đi ra biên.", "Return the number of land cells that cannot reach the boundary."), { final: true, vars: [{ name: "answer", value: answer }] });
      return answer;
    },
    invalidNote: text("Grid phải là ma trận chữ nhật chỉ gồm 0 và 1.", "The grid must be rectangular and contain only 0 and 1."),
  });
}

const graphCategory = { key: "graph", vi: "Đồ thị", en: "Graph" };
const multiSourceTag = { key: "multi-source-bfs", vi: "Multi-source BFS", en: "Multi-source BFS" };

const problems = {
  1162: {
    id: 1162,
    difficulty: "medium",
    slug: "as-far-from-land-as-possible",
    tags: [multiSourceTag],
    category: graphCategory,
    title: text("As Far from Land as Possible", "As Far from Land as Possible"),
    titleVi: text("Ô biển xa đất nhất", "Farthest water cell from land"),
    statement: text(
      "Cho grid vuông gồm 0 = biển và 1 = đất. Trả về khoảng cách Manhattan lớn nhất từ một ô biển tới ô đất gần nhất; trả -1 nếu chỉ có đất hoặc chỉ có biển.",
      "Given a square grid of water 0 and land 1, return the maximum Manhattan distance from a water cell to its nearest land; return -1 for all-land or all-water grids."
    ),
    defaultInput: "1,0,1|0,0,0|1,0,1",
    inputKind: "string",
    inputLabel: text("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    approach: [
      text("Đưa tất cả ô đất vào queue với distance 0.", "Put every land cell in the queue with distance 0."),
      text("Multi-source BFS lan đồng thời ra mọi ô biển chưa thăm.", "Multi-source BFS expands simultaneously into every unvisited water cell."),
      text("Giá trị distance lớn nhất sau BFS là đáp án.", "The largest distance after BFS is the answer."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Mỗi ô được enqueue tối đa một lần.", "Each cell is enqueued at most once.") },
    code: [
      "from collections import deque",
      "from typing import List",
      "",
      "class Solution:",
      "    def maxDistance(self, grid: List[List[int]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        distance = [[-1 for col in range(cols)] for row in range(rows)]",
      "        queue = deque()",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] == 1:",
      "                    distance[row][col] = 0",
      "                    queue.append((row, col))",
      "        if not queue or len(queue) == rows * cols: return -1",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "        while queue:",
      "            row, col = queue.popleft()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if 0 <= next_row < rows and 0 <= next_col < cols and distance[next_row][next_col] == -1:",
      "                    distance[next_row][next_col] = distance[row][col] + 1",
      "                    queue.append((next_row, next_col))",
      "        return max(max(row) for row in distance)",
    ],
    builder: buildSteps1162,
  },
  1765: {
    id: 1765,
    difficulty: "medium",
    slug: "map-of-highest-peak",
    tags: [multiSourceTag],
    category: graphCategory,
    title: text("Map of Highest Peak", "Map of Highest Peak"),
    titleVi: text("Xây bản đồ độ cao từ mặt nước", "Build a height map from water"),
    statement: text(
      "Cho isWater gồm 1 = nước và 0 = đất. Gán height không âm sao cho nước có height 0, hai ô kề lệch tối đa 1, và height lớn nhất có thể.",
      "Given isWater with water 1 and land 0, assign nonnegative heights so water is 0, adjacent cells differ by at most 1, and the maximum height is as large as possible."
    ),
    defaultInput: "0,1|0,0",
    inputKind: "string",
    inputLabel: text("isWater 0/1 (hàng cách '|')", "0/1 isWater grid (rows separated by '|')"),
    approach: [
      text("Đưa tất cả ô nước vào queue với height 0.", "Put every water cell in the queue with height 0."),
      text("BFS lan ra đất; height mới bằng height hiện tại + 1.", "BFS expands onto land; each new height is current height + 1."),
      text("Lần đầu một ô được thăm cho height nhỏ nhất từ nước và tối ưu height cực đại.", "A cell's first visit gives its minimum distance from water and optimizes the peak height."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Mỗi ô được xử lý đúng một lần.", "Each cell is processed once.") },
    code: [
      "from collections import deque",
      "from typing import List",
      "",
      "class Solution:",
      "    def highestPeak(self, isWater: List[List[int]]) -> List[List[int]]:",
      "        rows, cols = len(isWater), len(isWater[0])",
      "        height = [[-1 for col in range(cols)] for row in range(rows)]",
      "        queue = deque()",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if isWater[row][col] == 1:",
      "                    height[row][col] = 0",
      "                    queue.append((row, col))",
      "        if not queue: return []",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "        while queue:",
      "            row, col = queue.popleft()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if 0 <= next_row < rows and 0 <= next_col < cols and height[next_row][next_col] == -1:",
      "                    height[next_row][next_col] = height[row][col] + 1",
      "                    queue.append((next_row, next_col))",
      "        return height",
    ],
    builder: buildSteps1765,
  },
  286: {
    id: 286,
    difficulty: "medium",
    premium: true,
    slug: "walls-and-gates",
    tags: [multiSourceTag],
    category: graphCategory,
    title: text("Walls and Gates", "Walls and Gates"),
    titleVi: text("Khoảng cách phòng tới gate gần nhất", "Distance from rooms to nearest gates"),
    statement: text(
      "Rooms chứa -1 = tường, 0 = gate và 2147483647 = phòng trống. Điền mỗi phòng bằng khoảng cách tới gate gần nhất.",
      "Rooms contains -1 walls, 0 gates, and 2147483647 empty rooms. Fill each room with its distance to the nearest gate."
    ),
    defaultInput: "2147483647,-1,0,2147483647|2147483647,2147483647,2147483647,-1|2147483647,-1,2147483647,-1|0,-1,2147483647,2147483647",
    inputKind: "string",
    inputLabel: text("Rooms (-1, 0, 2147483647)", "Rooms (-1, 0, 2147483647)"),
    approach: [
      text("Đưa tất cả gate vào queue trước khi BFS.", "Put every gate in the queue before BFS."),
      text("Chỉ đi vào phòng còn INF; gán distance hiện tại + 1.", "Enter only INF rooms; assign current distance + 1."),
      text("Tường chặn đường và mỗi phòng được enqueue tối đa một lần.", "Walls block movement and every room is enqueued at most once."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Một lần multi-source BFS thay cho BFS riêng từ từng phòng.", "One multi-source BFS replaces a separate BFS from every room.") },
    code: [
      "from collections import deque",
      "from typing import List",
      "",
      "class Solution:",
      "    def wallsAndGates(self, rooms: List[List[int]]) -> List[List[int]]:",
      "        rows, cols = len(rooms), len(rooms[0])",
      "        INF = 2147483647",
      "        queue = deque()",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if rooms[row][col] == 0:",
      "                    rooms[row][col] = 0",
      "                    queue.append((row, col))",
      "        if not queue: return rooms",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "        while queue:",
      "            row, col = queue.popleft()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if 0 <= next_row < rows and 0 <= next_col < cols and rooms[next_row][next_col] == INF:",
      "                    rooms[next_row][next_col] = rooms[row][col] + 1",
      "                    queue.append((next_row, next_col))",
      "        return rooms",
    ],
    builder: buildSteps286,
  },
  934: {
    id: 934,
    difficulty: "medium",
    slug: "shortest-bridge",
    tags: [multiSourceTag],
    category: graphCategory,
    title: text("Shortest Bridge", "Shortest Bridge"),
    titleVi: text("Cây cầu ngắn nhất giữa hai đảo", "Shortest bridge between two islands"),
    statement: text("Grid có đúng hai đảo. Trả về số ô nước ít nhất cần đổi thành đất để nối hai đảo.", "The grid contains exactly two islands. Return the minimum number of water cells to flip to connect them."),
    defaultInput: "0,1,0|0,0,0|0,0,1",
    inputKind: "string",
    inputLabel: text("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    approach: [
      text("DFS đánh dấu toàn bộ đảo đầu tiên A.", "DFS marks the entire first island A."),
      text("Đưa mọi ô của A vào queue như nhiều nguồn BFS distance 0.", "Put every A cell in the queue as a BFS source at distance 0."),
      text("BFS qua nước; lần đầu chạm đảo B là số ô nước nhỏ nhất cần lật.", "BFS across water; the first contact with island B gives the minimum flips."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("DFS và BFS mỗi ô tối đa một lần.", "DFS and BFS each process a cell at most once.") },
    code: [
      "from collections import deque", "from typing import List", "", "class Solution:",
      "    def shortestBridge(self, grid: List[List[int]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        queue = deque()",
      "        visited = set()",
      "        def mark_first_island(start_row, start_col):",
      "            stack = [(start_row, start_col)]",
      "            while stack:",
      "                row, col = stack.pop()",
      "                if not (0 <= row < rows and 0 <= col < cols) or (row, col) in visited or grid[row][col] != 1: continue",
      "                visited.add((row, col))",
      "                queue.append((row, col, 0))",
      "                for delta_row, delta_col in directions:",
      "                    stack.append((row + delta_row, col + delta_col))",
      "        found = False",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] == 1:",
      "                    mark_first_island(row, col)",
      "                    found = True",
      "                    break",
      "            if found: break",
      "        while queue:",
      "            row, col, distance = queue.popleft()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if not (0 <= next_row < rows and 0 <= next_col < cols) or (next_row, next_col) in visited: continue",
      "                if grid[next_row][next_col] == 1:",
      "                    return distance",
      "                visited.add((next_row, next_col))",
      "                queue.append((next_row, next_col, distance + 1))",
      "        return -1",
    ],
    builder: buildSteps934,
  },
  417: {
    id: 417,
    difficulty: "medium",
    slug: "pacific-atlantic-water-flow",
    tags: [multiSourceTag],
    category: graphCategory,
    title: text("Pacific Atlantic Water Flow", "Pacific Atlantic Water Flow"),
    titleVi: text("Nước chảy tới cả hai đại dương", "Water flow to both oceans"),
    statement: text("Tìm mọi ô mà nước có thể chảy xuống hoặc ngang tới cả Pacific và Atlantic.", "Find every cell from which water can flow downhill or level to both the Pacific and Atlantic oceans."),
    defaultInput: "1,2,2,3,5|3,2,3,4,4|2,4,5,3,1|6,7,1,4,5|5,1,1,2,4",
    inputKind: "string",
    inputLabel: text("Heights (hàng cách '|')", "Heights (rows separated by '|')"),
    approach: [
      text("Đi ngược dòng từ toàn bộ biên Pacific và Atlantic.", "Run reverse flow from every Pacific and Atlantic border cell."),
      text("Reverse BFS chỉ đi sang ô có height lớn hơn hoặc bằng ô hiện tại.", "Reverse BFS moves only to a cell whose height is at least the current height."),
      text("Giao của hai tập reachable là kết quả.", "The intersection of the two reachable sets is the result."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Hai BFS tuyến tính trên cùng grid.", "Two linear BFS traversals over the same grid.") },
    code: [
      "from collections import deque", "from typing import List", "", "class Solution:",
      "    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:",
      "        rows, cols = len(heights), len(heights[0])",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        def bfs(starts):",
      "            reachable = set(starts)",
      "            queue = deque(starts)",
      "            while queue:",
      "                row, col = queue.popleft()",
      "                for delta_row, delta_col in directions:",
      "                    next_row, next_col = row + delta_row, col + delta_col",
      "                    if not (0 <= next_row < rows and 0 <= next_col < cols) or (next_row, next_col) in reachable: continue",
      "                    if heights[next_row][next_col] < heights[row][col]: continue",
      "                    reachable.add((next_row, next_col))",
      "                    queue.append((next_row, next_col))",
      "            return reachable",
      "        pacific_starts = [(0,c) for c in range(cols)] + [(r,0) for r in range(1, rows)]",
      "        atlantic_starts = [(rows-1,c) for c in range(cols)] + [(r,cols-1) for r in range(rows-1)]",
      "        pacific = bfs(pacific_starts)",
      "        atlantic = bfs(atlantic_starts)",
      "        result = []",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if (row, col) in pacific and (row, col) in atlantic:",
      "                    result.append([row, col])",
      "        return result",
    ],
    builder: buildSteps417,
  },
  130: {
    id: 130,
    difficulty: "medium",
    slug: "surrounded-regions",
    category: { key: "dfs", vi: "DFS", en: "DFS" },
    tags: [multiSourceTag],
    title: text("Surrounded Regions", "Surrounded Regions"),
    titleVi: text("Multi-source BFS từ các vùng ở biên", "Multi-source BFS from border regions"),
    statement: text("Đổi mọi O bị X bao quanh thành X; các O nối bốn hướng tới biên được giữ lại.", "Flip every O surrounded by X; O cells connected in four directions to the border remain unchanged."),
    defaultInput: "XXXX|XOOX|XXOX|XOXX",
    inputKind: "string",
    inputLabel: text("Board X/O (hàng cách '|')", "X/O board (rows separated by '|')"),
    approach: [
      text("Đưa mọi O ở biên vào queue và đánh dấu S (safe).", "Put every border O in the queue and mark it S (safe)."),
      text("BFS đánh dấu toàn bộ O nối với biên là safe.", "BFS marks every O connected to the border safe."),
      text("O còn lại đổi thành X; S được khôi phục thành O.", "Remaining O cells become X; S cells are restored to O."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Mỗi ô được quét hằng số lần và enqueue tối đa một lần.", "Each cell is scanned a constant number of times and enqueued at most once.") },
    code: [
      "from collections import deque", "from typing import List", "", "class Solution:",
      "    def solve(self, board: List[List[str]]) -> List[List[str]]:",
      "        rows, cols = len(board), len(board[0])",
      "        queue = deque()",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if (row in (0, rows-1) or col in (0, cols-1)) and board[row][col] == 'O':",
      "                    board[row][col] = 'S'",
      "                    queue.append((row, col))",
      "        while queue:",
      "            row, col = queue.popleft()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if 0 <= next_row < rows and 0 <= next_col < cols and board[next_row][next_col] == 'O':",
      "                    board[next_row][next_col] = 'S'",
      "                    queue.append((next_row, next_col))",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if board[row][col] == 'O': board[row][col] = 'X'",
      "                elif board[row][col] == 'S': board[row][col] = 'O'",
      "        return board",
    ],
    builder: buildSteps130Bfs,
  },
  1020: {
    id: 1020,
    difficulty: "medium",
    slug: "number-of-enclaves",
    tags: [multiSourceTag],
    category: graphCategory,
    title: text("Number of Enclaves", "Number of Enclaves"),
    titleVi: text("Đếm đất không thể đi ra biên", "Count land that cannot reach the border"),
    statement: text("Trả về số ô đất không thể đi bộ theo bốn hướng tới biên grid.", "Return the number of land cells from which a four-directional walk cannot reach the grid boundary."),
    defaultInput: "0,0,0,0|1,0,1,0|0,1,1,0|0,0,0,0",
    inputKind: "string",
    inputLabel: text("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    approach: [
      text("Đưa mọi ô đất ở biên vào queue và xóa thành 0.", "Put every border land cell in the queue and erase it to 0."),
      text("BFS xóa toàn bộ đất nối với biên.", "BFS removes all land connected to the boundary."),
      text("Tổng các ô 1 còn lại chính là số enclave cells.", "The sum of remaining 1 cells is the enclave count."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Mỗi ô đất nối biên được enqueue tối đa một lần.", "Each boundary-connected land cell is enqueued at most once.") },
    code: [
      "from collections import deque", "from typing import List", "", "class Solution:",
      "    def numEnclaves(self, grid: List[List[int]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        queue = deque()",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if (row in (0, rows-1) or col in (0, cols-1)) and grid[row][col] == 1:",
      "                    grid[row][col] = 0",
      "                    queue.append((row, col))",
      "        while queue:",
      "            row, col = queue.popleft()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if 0 <= next_row < rows and 0 <= next_col < cols and grid[next_row][next_col] == 1:",
      "                    grid[next_row][next_col] = 0",
      "                    queue.append((next_row, next_col))",
      "        enclaves = sum(sum(row) for row in grid)",
      "        return enclaves",
    ],
    builder: buildSteps1020,
  },
};

module.exports = problems;
