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

function createRecorder(rows, cols, getCells, getQueue, getExtraView = null) {
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
      ...(getExtraView ? getExtraView(codeLine, options) : {}),
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

  const recorder = createRecorder(
    rows,
    cols,
    cells,
    () => queue,
    config.makeView
      ? (codeLine, options) => ({
        [config.viewKey]: config.makeView({
          grid,
          values,
          queue,
          sourceCount,
          targetCount,
          codeLine,
          options,
        }),
      })
      : null,
  );
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
        origin: [row, col],
        direction: [deltaRow, deltaCol],
        vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }],
      });
      const nextRow = row + deltaRow;
      const nextCol = col + deltaCol;
      push(19, text(`next = (${nextRow},${nextCol})`, `next = (${nextRow},${nextCol})`), text("Tính tọa độ ô kế tiếp.", "Compute the neighboring coordinates."), {
        current: [row, col],
        origin: [row, col],
        direction: [deltaRow, deltaCol],
        vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
      });
      const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
      const canVisit = inBounds && config.canVisit(grid[nextRow][nextCol], values[nextRow][nextCol]);
      push(20, config.visitTitle(nextRow, nextCol, canVisit), canVisit ? config.visitTrueNote : config.visitFalseNote, {
        current: inBounds ? [nextRow, nextCol] : [row, col],
        origin: [row, col],
        direction: [deltaRow, deltaCol],
        vars: [{ name: "in bounds?", value: inBounds }, { name: "can visit?", value: canVisit }],
      });
      if (!canVisit) continue;
      values[nextRow][nextCol] = values[row][col] + 1;
      push(21, config.assignTitle(nextRow, nextCol, values[nextRow][nextCol]), config.assignNote, {
        current: [nextRow, nextCol],
        discovered: [nextRow, nextCol],
        origin: [row, col],
        direction: [deltaRow, deltaCol],
        vars: [{ name: "current value", value: values[row][col] }, { name: "new value", value: values[nextRow][nextCol] }],
      });
      queue.push([nextRow, nextCol]);
      push(22, text(`queue.append((${nextRow},${nextCol}))`, `queue.append((${nextRow},${nextCol}))`), text("Thêm ô vừa khám phá vào queue.", "Append the discovered cell to the queue."), {
        current: [nextRow, nextCol],
        discovered: [nextRow, nextCol],
        origin: [row, col],
        direction: [deltaRow, deltaCol],
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
  const parsed = parseGrid(input, new Set(["0", "1"]));
  const original = parsed.grid.map((row) => row.map(Number));
  if (!parsed.valid) {
    return invalidResult(
      original,
      text("Grid phải là ma trận chữ nhật chỉ gồm 0 và 1.", "Grid must be rectangular and contain only 0 and 1."),
    );
  }

  const grid = original.map((row) => [...row]);
  const rows = grid.length;
  const cols = grid[0].length;
  const values = original.map((row) => row.map((value) => value === 1 ? 0 : -1));
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const sourceTotal = original.flat().filter((value) => value === 1).length;
  const waterCount = rows * cols - sourceTotal;
  let sourceCount = 0;
  let queue = null;

  const cellKey = (row, col) => `${row},${col}`;
  function cells(current, discovered) {
    const queued = new Set((queue || []).map(([row, col]) => cellKey(row, col)));
    return original.map((matrixRow, row) => matrixRow.map((inputValue, col) => {
      const value = values[row][col];
      let cls = inputValue === 1 ? "visited" : value < 0 ? "empty" : "visited";
      if (queued.has(cellKey(row, col))) cls = "queued";
      if (discovered && discovered[0] === row && discovered[1] === col) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label: inputValue === 1 ? "L" : value < 0 ? "∞" : String(value), cls };
    }));
  }

  function makeView(codeLine, options) {
    const levelCounts = new Map();
    let knownWater = 0;
    let maxDistance = -1;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const value = values[row][col];
        if (original[row][col] !== 0 || value < 0) continue;
        knownWater += 1;
        maxDistance = Math.max(maxDistance, value);
        levelCounts.set(value, (levelCounts.get(value) || 0) + 1);
      }
    }
    const answerValue = options.final
      ? Number(options.vars?.find((item) => item.name === "answer")?.value)
      : null;
    const events = {
      9: "scan",
      10: "scan",
      11: "source-check",
      12: "source-enqueue",
      14: "edge-check",
      15: "result",
      17: "directions",
      20: "distance-init",
      22: "queue-check",
      23: "wave-start",
      25: "layer-item",
      26: "dequeue",
      28: "direction",
      29: "neighbor",
      31: "neighbor-check",
      35: "distance-update",
      36: "enqueue",
      38: "result",
    };
    return {
      phase: options.final ? "result" : codeLine >= 22 ? "bfs" : "sources",
      event: events[codeLine] || "setup",
      codeLine,
      rows,
      cols,
      cells: original.map((matrixRow, row) => matrixRow.map((inputValue, col) => ({
        row,
        col,
        isLand: inputValue === 1,
        distance: inputValue === 1 ? 0 : values[row][col],
      }))),
      current: options.current ? [...options.current] : null,
      discovered: options.discovered ? [...options.discovered] : null,
      origin: options.origin ? [...options.origin] : null,
      direction: options.direction ? [...options.direction] : null,
      queue: (queue || []).map(([row, col]) => ({ row, col, distance: values[row][col] })),
      sourceCount,
      sourceTotal,
      waterCount,
      knownWater,
      maxDistance,
      levels: Array.from(levelCounts, ([distance, count]) => ({ distance, count }))
        .sort((a, b) => a.distance - b.distance),
      answer: Number.isFinite(answerValue) ? answerValue : null,
    };
  }

  const { steps, push } = createRecorder(
    rows,
    cols,
    cells,
    () => queue,
    (codeLine, options) => ({ landDistance1162View: makeView(codeLine, options) }),
  );

  push(5, text("Bắt đầu maxDistance", "Enter maxDistance"), text("Nhận bản đồ đất và biển.", "Receive the land-and-water grid."), {
    vars: [{ name: "grid size", value: `${rows}×${cols}` }],
  });
  push(6, text(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), text("Lưu kích thước grid.", "Store the grid dimensions."), {
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
  });
  queue = [];
  push(7, text("queue = deque()", "queue = deque()"), text("Tạo queue cho BFS đa nguồn.", "Create the multi-source BFS queue."));

  for (let row = 0; row < rows; row += 1) {
    push(9, text(`Quét row = ${row}`, `Scan row = ${row}`), text(`Bắt đầu hàng ${row}.`, `Begin row ${row}.`), {
      vars: [{ name: "row", value: row }],
    });
    for (let col = 0; col < cols; col += 1) {
      push(10, text(`Quét ô (${row},${col})`, `Scan cell (${row},${col})`), text("Tìm các ô đất ban đầu.", "Find the initial land cells."), {
        current: [row, col],
        vars: [{ name: "row", value: row }, { name: "col", value: col }],
      });
      const isLand = grid[row][col] === 1;
      push(11, text(`grid[${row}][${col}] == 1 → ${isLand}`, `grid[${row}][${col}] == 1 → ${isLand}`), isLand
        ? text("Đây là một nguồn BFS.", "This is a BFS source.")
        : text("Ô biển chờ sóng BFS lan tới.", "This water cell waits for a BFS wave."), {
        current: [row, col],
        vars: [{ name: "is land?", value: isLand }],
      });
      if (!isLand) continue;
      sourceCount += 1;
      queue.push([row, col]);
      push(12, text(`queue.append((${row},${col}))`, `queue.append((${row},${col}))`), text("Đưa nguồn đất vào queue.", "Put the land source in the queue."), {
        current: [row, col],
        vars: [{ name: "sources", value: sourceCount }],
      });
    }
  }

  const earlyStop = queue.length === 0 || queue.length === rows * cols;
  push(14, text(`Không có đất hoặc không có biển → ${earlyStop}`, `No land or no water → ${earlyStop}`), earlyStop
    ? text("Không có đủ cả đất và biển.", "The grid does not contain both land and water.")
    : text("Có cả đất và biển; tiếp tục BFS.", "Both land and water exist; continue BFS."), {
    vars: [{ name: "queue size", value: queue.length }],
  });
  if (earlyStop) {
    push(15, text("return -1", "return -1"), text("Trường hợp đặc biệt trả về -1.", "Return -1 for the edge case."), {
      final: true,
      vars: [{ name: "answer", value: -1 }],
    });
    return { original, answer: -1, steps };
  }

  push(17, text("Khai báo 4 hướng", "Define four directions"), text("BFS đi xuống, lên, phải và trái.", "BFS moves down, up, right, and left."), {
    vars: [{ name: "directions", value: "down, up, right, left" }],
  });
  let distance = -1;
  push(20, text("distance = -1", "distance = -1"), text("Mỗi vòng while sẽ tăng thêm một lớp khoảng cách.", "Each while-loop pass advances one distance layer."), {
    vars: [{ name: "distance", value: distance }],
  });

  while (queue.length) {
    push(22, text("while queue → True", "while queue → True"), text("Queue còn một lớp cần mở rộng.", "The queue still has a layer to expand."), {
      vars: [{ name: "condition", value: true }, { name: "queue size", value: queue.length }],
    });
    distance += 1;
    push(23, text(`distance += 1 → ${distance}`, `distance += 1 → ${distance}`), text(`Bắt đầu lớp sóng ${distance}.`, `Begin wave ${distance}.`), {
      vars: [{ name: "distance", value: distance }],
    });
    const layerSize = queue.length;
    for (let index = 0; index < layerSize; index += 1) {
      push(25, text(`Ô ${index + 1}/${layerSize} trong lớp`, `Cell ${index + 1}/${layerSize} in layer`), text("Chỉ xử lý các ô đã có sẵn trong lớp này.", "Process only the cells already in this layer."), {
        vars: [{ name: "layer size", value: layerSize }, { name: "index", value: index }],
      });
      const [row, col] = queue.shift();
      push(26, text(`popleft → (${row},${col})`, `popleft → (${row},${col})`), text("Lấy ô đầu queue.", "Remove the front cell."), {
        current: [row, col],
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "distance", value: distance }],
      });
      for (const [dr, dc] of directions) {
        push(28, text(`Thử hướng (${dr},${dc})`, `Try direction (${dr},${dc})`), text("Nhìn sang một ô kề.", "Look at one neighboring cell."), {
          current: [row, col],
          origin: [row, col],
          direction: [dr, dc],
          vars: [{ name: "dr", value: dr }, { name: "dc", value: dc }],
        });
        const nr = row + dr;
        const nc = col + dc;
        push(29, text(`next = (${nr},${nc})`, `next = (${nr},${nc})`), text("Tính vị trí ô kề.", "Compute the neighbor position."), {
          current: [row, col],
          origin: [row, col],
          direction: [dr, dc],
          vars: [{ name: "nr", value: nr }, { name: "nc", value: nc }],
        });
        const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
        const canVisit = inBounds && grid[nr][nc] === 0;
        push(31, text(`Ô (${nr},${nc}) là biển chưa thăm → ${canVisit}`, `Cell (${nr},${nc}) is unvisited water → ${canVisit}`), canVisit
          ? text("Sóng BFS có thể lan vào ô này.", "The BFS wave can enter this cell.")
          : text("Ngoài biên hoặc đã biến thành đất; bỏ qua.", "Out of bounds or already marked as land; skip it."), {
          current: inBounds ? [nr, nc] : [row, col],
          origin: [row, col],
          direction: [dr, dc],
          vars: [{ name: "in bounds?", value: inBounds }, { name: "can visit?", value: canVisit }],
        });
        if (!canVisit) continue;
        grid[nr][nc] = 1;
        values[nr][nc] = distance + 1;
        push(35, text(`grid[${nr}][${nc}] = 1`, `grid[${nr}][${nc}] = 1`), text("Đánh dấu ngay để ô biển không vào queue lần nữa.", "Mark it immediately so it cannot be enqueued twice."), {
          current: [nr, nc],
          discovered: [nr, nc],
          origin: [row, col],
          direction: [dr, dc],
          vars: [{ name: "new distance", value: values[nr][nc] }],
        });
        queue.push([nr, nc]);
        push(36, text(`queue.append((${nr},${nc}))`, `queue.append((${nr},${nc}))`), text("Đưa ô mới vào lớp sóng kế tiếp.", "Add the new cell to the next wave."), {
          current: [nr, nc],
          discovered: [nr, nc],
          origin: [row, col],
          direction: [dr, dc],
        });
      }
    }
  }

  push(22, text("while queue → False", "while queue → False"), text("Không còn ô nào; BFS hoàn tất.", "No cells remain; BFS is complete."), {
    vars: [{ name: "condition", value: false }, { name: "distance", value: distance }],
  });
  push(38, text(`return ${distance}`, `return ${distance}`), text(`Lớp cuối cùng có khoảng cách ${distance}.`, `The last wave has distance ${distance}.`), {
    final: true,
    vars: [{ name: "answer", value: distance }],
  });
  return { original, answer: distance, steps };
}

function buildSteps1765(input) {
  const parsed = parseGrid(input, new Set(["0", "1"]));
  const original = parsed.grid.map((row) => row.map(Number));
  if (!parsed.valid) {
    return invalidResult(
      original,
      text("isWater phải là ma trận chữ nhật chỉ gồm 0 và 1.", "isWater must be rectangular and contain only 0 and 1."),
    );
  }

  const rows = original.length;
  const cols = original[0].length;
  const heights = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const sourceTotal = original.flat().filter((value) => value === 1).length;
  const totalCells = rows * cols;
  let sourceCount = 0;
  let queue = null;

  const cellKey = (row, col) => `${row},${col}`;
  function cells(current, discovered) {
    const queued = new Set((queue || []).map(([row, col]) => cellKey(row, col)));
    return original.map((matrixRow, row) => matrixRow.map((isWater, col) => {
      const height = heights[row][col];
      let cls = height < 0 ? "empty" : "visited";
      if (queued.has(cellKey(row, col))) cls = "queued";
      if (discovered && discovered[0] === row && discovered[1] === col) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label: isWater ? "💧" : height < 0 ? "?" : String(height), cls };
    }));
  }

  function makeView(codeLine, options) {
    const levels = new Map();
    let assignedCount = 0;
    let maxHeight = -1;
    heights.forEach((row) => row.forEach((height) => {
      if (height < 0) return;
      assignedCount += 1;
      maxHeight = Math.max(maxHeight, height);
      levels.set(height, (levels.get(height) || 0) + 1);
    }));
    return {
      phase: options.final ? "result" : codeLine >= 22 ? "bfs" : "sources",
      event: options.event || "setup",
      codeLine,
      rows,
      cols,
      cells: original.map((matrixRow, row) => matrixRow.map((isWater, col) => ({
        row,
        col,
        isWater: isWater === 1,
        height: heights[row][col],
      }))),
      current: options.current ? [...options.current] : null,
      discovered: options.discovered ? [...options.discovered] : null,
      origin: options.origin ? [...options.origin] : null,
      direction: options.direction ? [...options.direction] : null,
      queue: (queue || []).map(([row, col]) => ({ row, col, height: heights[row][col] })),
      sourceCount,
      sourceTotal,
      assignedCount,
      totalCells,
      maxHeight,
      levels: Array.from(levels, ([height, count]) => ({ height, count })).sort((a, b) => a.height - b.height),
      answer: options.final ? heights.map((row) => [...row]) : null,
    };
  }

  const { steps, push } = createRecorder(
    rows,
    cols,
    cells,
    () => queue,
    (codeLine, options) => ({ highestPeak1765View: makeView(codeLine, options) }),
  );

  push(5, text("Bắt đầu highestPeak", "Enter highestPeak"), text("Nhận bản đồ nước và đất.", "Receive the water-and-land map."), {
    event: "enter",
    vars: [{ name: "grid size", value: `${rows}×${cols}` }],
  });
  push(6, text(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), text("Lưu kích thước bản đồ.", "Store the map dimensions."), {
    event: "dimensions",
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
  });
  push(8, text("heights = -1", "heights = -1"), text("Mọi ô bắt đầu ở trạng thái chưa có độ cao.", "Every cell starts without a height."), {
    event: "height-init",
    vars: [{ name: "heights", value: "all -1" }],
  });
  queue = [];
  push(9, text("queue = deque()", "queue = deque()"), text("Tạo hàng đợi BFS đa nguồn.", "Create the multi-source BFS queue."), {
    event: "queue-init",
  });

  for (let row = 0; row < rows; row += 1) {
    push(12, text(`Quét row = ${row}`, `Scan row = ${row}`), text("Tìm các ô nước.", "Find water cells."), {
      event: "scan-row",
      vars: [{ name: "row", value: row }],
    });
    for (let col = 0; col < cols; col += 1) {
      push(13, text(`Quét ô (${row},${col})`, `Scan cell (${row},${col})`), text("Kiểm tra ô tiếp theo.", "Inspect the next cell."), {
        event: "scan-cell",
        current: [row, col],
        vars: [{ name: "row", value: row }, { name: "col", value: col }],
      });
      const isWater = original[row][col] === 1;
      push(14, text(`isWater[${row}][${col}] == 1 → ${isWater}`, `isWater[${row}][${col}] == 1 → ${isWater}`), isWater
        ? text("Ô nước là một nguồn BFS.", "This water cell is a BFS source.")
        : text("Ô đất sẽ nhận độ cao khi sóng lan tới.", "Land receives a height when the wave reaches it."), {
        event: "source-check",
        current: [row, col],
        vars: [{ name: "is water?", value: isWater }],
      });
      if (!isWater) continue;
      heights[row][col] = 0;
      sourceCount += 1;
      push(15, text(`heights[${row}][${col}] = 0`, `heights[${row}][${col}] = 0`), text("Mặt nước có độ cao 0.", "Water has height 0."), {
        event: "source-height",
        current: [row, col],
        discovered: [row, col],
        vars: [{ name: "height", value: 0 }],
      });
      queue.push([row, col]);
      push(16, text(`queue.append((${row},${col}))`, `queue.append((${row},${col}))`), text("Thêm nguồn nước vào queue.", "Add the water source to the queue."), {
        event: "source-enqueue",
        current: [row, col],
        vars: [{ name: "sources", value: sourceCount }],
      });
    }
  }

  push(18, text("Khai báo 4 hướng", "Define four directions"), text("Sóng lan xuống, lên, phải và trái.", "The wave expands down, up, right, and left."), {
    event: "directions",
    vars: [{ name: "directions", value: "↓ ↑ → ←" }],
  });

  while (queue.length) {
    push(22, text("while queue → True", "while queue → True"), text("Queue còn ô cần lan tiếp.", "The queue still has a cell to expand."), {
      event: "queue-check",
      vars: [{ name: "queue size", value: queue.length }],
    });
    const [row, col] = queue.shift();
    push(23, text(`popleft → (${row},${col})`, `popleft → (${row},${col})`), text("Lấy ô ở đầu queue.", "Remove the front cell."), {
      event: "dequeue",
      current: [row, col],
      vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "height", value: heights[row][col] }],
    });
    for (const [dr, dc] of directions) {
      push(25, text(`Thử hướng (${dr},${dc})`, `Try direction (${dr},${dc})`), text("Nhìn sang một ô kề.", "Look at one neighbor."), {
        event: "direction",
        current: [row, col],
        origin: [row, col],
        direction: [dr, dc],
        vars: [{ name: "dr", value: dr }, { name: "dc", value: dc }],
      });
      const nr = row + dr;
      const nc = col + dc;
      push(26, text(`next = (${nr},${nc})`, `next = (${nr},${nc})`), text("Tính tọa độ ô kề.", "Compute the neighbor coordinates."), {
        event: "neighbor",
        current: [row, col],
        origin: [row, col],
        direction: [dr, dc],
        vars: [{ name: "nr", value: nr }, { name: "nc", value: nc }],
      });
      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      const canVisit = inBounds && heights[nr][nc] === -1;
      push(28, text(`Ô (${nr},${nc}) chưa có height → ${canVisit}`, `Cell (${nr},${nc}) has no height → ${canVisit}`), canVisit
        ? text("Sóng chạm ô này lần đầu.", "The wave reaches this cell for the first time.")
        : text("Ngoài biên hoặc đã có độ cao.", "Out of bounds or already assigned."), {
        event: "neighbor-check",
        current: inBounds ? [nr, nc] : [row, col],
        origin: [row, col],
        direction: [dr, dc],
        vars: [{ name: "in bounds?", value: inBounds }, { name: "can visit?", value: canVisit }],
      });
      if (!canVisit) continue;
      heights[nr][nc] = heights[row][col] + 1;
      push(32, text(`heights[${nr}][${nc}] = ${heights[nr][nc]}`, `heights[${nr}][${nc}] = ${heights[nr][nc]}`), text("Độ cao tăng 1 khi đi xa nước thêm một ô.", "Height increases by 1 for each step away from water."), {
        event: "height-update",
        current: [nr, nc],
        discovered: [nr, nc],
        origin: [row, col],
        direction: [dr, dc],
        vars: [{ name: "new height", value: heights[nr][nc] }],
      });
      queue.push([nr, nc]);
      push(33, text(`queue.append((${nr},${nc}))`, `queue.append((${nr},${nc}))`), text("Đưa ô mới vào cuối queue.", "Add the new cell to the back of the queue."), {
        event: "enqueue",
        current: [nr, nc],
        discovered: [nr, nc],
        origin: [row, col],
        direction: [dr, dc],
      });
    }
  }

  push(22, text("while queue → False", "while queue → False"), text("Queue rỗng; bản đồ đã hoàn tất.", "The queue is empty; the map is complete."), {
    event: "queue-empty",
    vars: [{ name: "queue size", value: 0 }],
  });
  const answer = heights.map((row) => [...row]);
  push(35, text("return heights", "return heights"), text("Trả về bản đồ độ cao.", "Return the height map."), {
    event: "result",
    final: true,
    vars: [{ name: "answer", value: JSON.stringify(answer) }],
  });
  return { original, answer, steps };
}

const INF = 2147483647;

function buildSteps286(input) {
  const parsed = parseGrid(input, new Set(["-1", "0", String(INF)]));
  const original = parsed.grid.map((row) => row.map(Number));
  if (!parsed.valid) return invalidResult(original, text("Rooms chỉ được chứa -1, 0 hoặc 2147483647.", "Rooms may contain only -1, 0, or 2147483647."));

  const rooms = original.map((row) => [...row]);
  const rows = rooms.length;
  const cols = rooms[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const sourceTotal = original.flat().filter((value) => value === 0).length;
  const roomTotal = original.flat().filter((value) => value === INF).length;
  const wallCount = original.flat().filter((value) => value === -1).length;
  let sourceCount = 0;
  let queue = null;
  let bfsStarted = false;
  const key = (row, col) => `${row},${col}`;

  function cells(current, discovered) {
    const queued = new Set((queue || []).map(([row, col]) => key(row, col)));
    return rooms.map((matrixRow, row) => matrixRow.map((value, col) => {
      const originalValue = original[row][col];
      let label = originalValue === -1 ? "🧱" : originalValue === 0 ? "🚪" : value === INF ? "?" : String(value);
      let cls = originalValue === -1 ? "wall" : originalValue === 0 ? "visited" : value === INF ? "empty" : "visited";
      if (queued.has(key(row, col))) cls = "queued";
      if (discovered && discovered[0] === row && discovered[1] === col) cls = "path";
      if (current && current[0] === row && current[1] === col) cls = "current";
      return { label, cls };
    }));
  }

  function makeView(options) {
    const assignedRoomCount = original.flatMap((matrixRow, row) => matrixRow.map((value, col) =>
      value === INF && rooms[row][col] !== INF ? 1 : 0
    )).reduce((sum, value) => sum + value, 0);
    const distances = rooms.flat().filter((value) => value >= 0 && value !== INF);
    const maxDistance = distances.length ? Math.max(...distances) : 0;
    const levels = Array.from({ length: maxDistance + 1 }, (_, distance) => ({
      distance,
      count: rooms.flat().filter((value) => value === distance).length,
    })).filter((level) => level.count > 0);
    return {
      phase: options.final ? "result" : bfsStarted ? "bfs" : "sources",
      event: options.event || "setup",
      rows,
      cols,
      cells: rooms.map((matrixRow, row) => matrixRow.map((value, col) => ({
        row,
        col,
        type: original[row][col] === -1 ? "wall" : original[row][col] === 0 ? "gate" : "room",
        distance: value === INF ? -1 : value,
      }))),
      current: options.current || null,
      discovered: options.discovered || null,
      origin: options.origin || null,
      direction: options.direction || null,
      queue: (queue || []).map(([row, col]) => ({ row, col, distance: rooms[row][col] })),
      sourceCount,
      sourceTotal,
      assignedRoomCount,
      roomTotal,
      wallCount,
      maxDistance,
      levels,
      answer: options.final ? rooms.map((row) => [...row]) : null,
    };
  }

  const { steps, push } = createRecorder(rows, cols, cells, () => queue, (_codeLine, options) => ({
    wallsGates286View: makeView(options),
  }));

  push(5, text("Bắt đầu wallsAndGates", "Enter wallsAndGates"), text("Điền rooms trực tiếp.", "Fill rooms in place."), { event: "enter" });
  push(6, text("rooms không rỗng", "rooms is not empty"), text("Có bản đồ để xử lý.", "There is a map to process."), { event: "empty-check", vars: [{ name: "empty?", value: false }] });
  push(9, text(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), text("Kích thước bản đồ.", "Map dimensions."), { event: "dimensions", vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }] });
  push(10, text("INF = 2147483647", "INF = 2147483647"), text("INF là phòng chưa được điền.", "INF is an unfilled room."), { event: "inf" });
  queue = [];
  push(11, text("queue = deque()", "queue = deque()"), text("Queue bắt đầu rỗng.", "The queue starts empty."), { event: "queue-init" });

  for (let row = 0; row < rows; row++) {
    push(13, text(`row = ${row}`, `row = ${row}`), text("Quét từng hàng.", "Scan each row."), { event: "scan-row", vars: [{ name: "row", value: row }] });
    for (let col = 0; col < cols; col++) {
      push(14, text(`col = ${col}`, `col = ${col}`), text("Quét từng ô.", "Scan each cell."), { event: "scan-cell", current: [row, col], vars: [{ name: "col", value: col }] });
      const isGate = rooms[row][col] === 0;
      push(15, text(`rooms[${row}][${col}] == 0 → ${isGate}`, `rooms[${row}][${col}] == 0 → ${isGate}`), isGate ? text("Tìm thấy gate.", "Gate found.") : text("Không phải gate.", "Not a gate."), { event: "gate-check", current: [row, col], vars: [{ name: "is gate?", value: isGate }] });
      if (!isGate) continue;
      queue.push([row, col]);
      sourceCount += 1;
      push(16, text(`queue.append((${row}, ${col}))`, `queue.append((${row}, ${col}))`), text("Gate vào queue ở khoảng cách 0.", "Gate enters the queue at distance 0."), { event: "gate-enqueue", current: [row, col], discovered: [row, col] });
    }
  }

  push(18, text("Khai báo 4 hướng", "Define four directions"), text("Chỉ đi lên, xuống, trái, phải.", "Move only up, down, left, and right."), { event: "directions" });
  bfsStarted = true;
  while (queue.length) {
    push(20, text("while queue → True", "while queue → True"), text("Lấy ô gần gate nhất trước.", "Process the nearest cell first."), { event: "while-check", vars: [{ name: "queue size", value: queue.length }] });
    const [row, col] = queue.shift();
    push(21, text(`popleft() → (${row}, ${col})`, `popleft() → (${row}, ${col})`), text("Đầu queue được mở rộng.", "Expand the front of the queue."), { event: "dequeue", current: [row, col], vars: [{ name: "distance", value: rooms[row][col] }] });

    for (const [deltaRow, deltaCol] of directions) {
      push(23, text(`hướng (${deltaRow}, ${deltaCol})`, `direction (${deltaRow}, ${deltaCol})`), text("Thử một hướng.", "Try one direction."), { event: "direction", current: [row, col], origin: [row, col], direction: [deltaRow, deltaCol] });
      const nextRow = row + deltaRow;
      push(24, text(`next_row = ${nextRow}`, `next_row = ${nextRow}`), text("Tính hàng kế tiếp.", "Compute the next row."), { event: "next-row", current: [row, col], origin: [row, col], direction: [deltaRow, deltaCol], vars: [{ name: "next_row", value: nextRow }] });
      const nextCol = col + deltaCol;
      push(25, text(`next_col = ${nextCol}`, `next_col = ${nextCol}`), text("Tính cột kế tiếp.", "Compute the next column."), { event: "next-col", current: [row, col], origin: [row, col], direction: [deltaRow, deltaCol], vars: [{ name: "next_col", value: nextCol }] });
      const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
      const canVisit = inBounds && rooms[nextRow][nextCol] === INF;
      push(27, text(`Phòng (${nextRow}, ${nextCol}) còn INF → ${canVisit}`, `Room (${nextRow}, ${nextCol}) is INF → ${canVisit}`), canVisit ? text("Sóng chạm phòng này lần đầu.", "The wave reaches this room first.") : text("Bị chặn hoặc đã điền.", "Blocked or already filled."), { event: "neighbor-check", current: inBounds ? [nextRow, nextCol] : [row, col], origin: [row, col], direction: [deltaRow, deltaCol], vars: [{ name: "in bounds?", value: inBounds }, { name: "can visit?", value: canVisit }] });
      if (!canVisit) continue;

      rooms[nextRow][nextCol] = rooms[row][col] + 1;
      push(31, text(`rooms[${nextRow}][${nextCol}] = ${rooms[nextRow][nextCol]}`, `rooms[${nextRow}][${nextCol}] = ${rooms[nextRow][nextCol]}`), text("Ghi khoảng cách tới gate gần nhất.", "Store the nearest-gate distance."), { event: "distance-update", current: [nextRow, nextCol], discovered: [nextRow, nextCol], origin: [row, col], direction: [deltaRow, deltaCol], vars: [{ name: "distance", value: rooms[nextRow][nextCol] }] });
      queue.push([nextRow, nextCol]);
      push(32, text(`queue.append((${nextRow}, ${nextCol}))`, `queue.append((${nextRow}, ${nextCol}))`), text("Đưa phòng mới vào cuối queue.", "Add the new room to the back of the queue."), { event: "enqueue", current: [nextRow, nextCol], discovered: [nextRow, nextCol], origin: [row, col], direction: [deltaRow, deltaCol] });
    }
  }

  const answer = rooms.map((row) => [...row]);
  push(20, text("while queue → False", "while queue → False"), text("Queue rỗng; rooms đã được cập nhật tại chỗ.", "The queue is empty; rooms is updated in place."), { event: "result", final: true, vars: [{ name: "answer", value: JSON.stringify(answer) }] });
  return { original, answer, steps };
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

function decorateSurroundedRegionsResult(result, marker, codeBlock) {
  const original = result.original || [];
  const rows = original.length;
  const cols = rows ? original[0].length : 0;
  const safe = new Set();
  const queue = [];
  const key = (row, col) => `${row},${col}`;
  const isInside = (row, col) => row >= 0 && row < rows && col >= 0 && col < cols;
  const seed = (row, col) => {
    const cellKey = key(row, col);
    if (isInside(row, col) && original[row][col] === "O" && !safe.has(cellKey)) {
      safe.add(cellKey);
      queue.push([row, col]);
    }
  };

  for (let col = 0; col < cols; col++) {
    seed(0, col);
    seed(rows - 1, col);
  }
  for (let row = 0; row < rows; row++) {
    seed(row, 0);
    seed(row, cols - 1);
  }
  for (let index = 0; index < queue.length; index++) {
    const [row, col] = queue[index];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) seed(row + dr, col + dc);
  }

  const borderCount = [...safe].filter((cellKey) => {
    const [row, col] = cellKey.split(",").map(Number);
    return row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
  }).length;

  for (const step of result.steps || []) {
    if (!step.bfsGrid || step.bfsGrid.rows !== rows || step.bfsGrid.cols !== cols) continue;
    const line = step.codeLines && step.codeLines[0];
    let phase;
    let event = "scan";
    if (step.final) {
      phase = "done";
      event = "done";
    } else if (codeBlock === 1) {
      phase = line <= 13 ? "border" : line <= 20 ? "spread" : "capture";
      if (line === 12 || line === 19) event = "mark-safe";
      else if (line === 13) event = "border-seeds";
      else if (line === 23) event = "flip";
      else if (line === 24) event = "restore-safe";
    } else {
      phase = line === 3 ? "border" : line >= 20 ? "capture" : "spread";
      if (line >= 14 && line <= 19) event = "border-seeds";
      else if (line === 9) event = "mark-safe";
      else if (line === 23) event = "flip";
      else if (line === 25) event = "restore-safe";
    }

    let current = null;
    let safeCount = 0;
    let capturedCount = 0;
    step.bfsGrid.variant = "surrounded-regions";
    step.bfsGrid.cells = step.bfsGrid.cells.map((boardRow, row) => boardRow.map((cell, col) => {
      const tokens = String(cell.cls || "empty").split(/\s+/).filter(Boolean);
      const cellKey = key(row, col);
      const isBorder = row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
      const isCurrent = tokens.includes("current");
      const isSafeMarker = cell.label === marker;
      const isRestoredSafe = (phase === "capture" || phase === "done") && cell.label === "O" && safe.has(cellKey);
      const isCaptured = original[row][col] === "O" && cell.label === "X";
      if (isCurrent) current = [row, col];
      if (isSafeMarker || isRestoredSafe) safeCount++;
      if (isCaptured) capturedCount++;

      const keep = tokens.filter((token) => !["wall", "empty", "path", "visited", "board-edge", "escape-gate"].includes(token));
      const base = isCaptured ? "visited" : isSafeMarker || isRestoredSafe ? "path" : cell.label === "X" ? "wall" : "empty";
      const classes = [base, ...keep];
      if (isBorder) classes.push("board-edge");
      if (isBorder && original[row][col] === "O") classes.push("escape-gate");
      return {
        ...cell,
        label: isSafeMarker ? "O" : cell.label,
        cls: [...new Set(classes)].join(" "),
        meta: isSafeMarker || isRestoredSafe ? "✓" : isCaptured ? "✕" : isBorder && original[row][col] === "O" ? "↗" : "",
      };
    }));

    step.surroundedRegionsView = {
      phase,
      event,
      current,
      borderCount,
      safeCount,
      capturedCount,
    };

    const coord = current ? `(${current[0]},${current[1]})` : "";
    if (event === "done") {
      step.title = text(`✓ ${safeCount}  ·  ✕ ${capturedCount}`, `✓ ${safeCount}  ·  ✕ ${capturedCount}`);
      step.note = text("Xong.", "Done.");
    } else if (event === "flip") {
      step.title = text(`${coord}: O → X`, `${coord}: O → X`);
      step.note = text("Kín → lật.", "Closed → flip.");
    } else if (event === "restore-safe") {
      step.title = text(`${coord}: ${marker} → O`, `${coord}: ${marker} → O`);
      step.note = text("Nối biên → giữ.", "Reaches edge → keep.");
    } else if (event === "mark-safe") {
      step.title = text(`${coord} → ✓`, `${coord} → ✓`);
      step.note = text("Nối biên.", "Border-connected.");
    } else if (event === "border-seeds") {
      step.title = text(`O@edge × ${borderCount}`, `O@edge × ${borderCount}`);
      step.note = text("Nguồn bắt đầu.", "Start sources.");
    } else {
      const label = phase === "border" ? "BIÊN" : phase === "spread" ? "LAN" : "LẬT";
      step.title = text(coord || label, coord || (phase === "border" ? "EDGE" : phase === "spread" ? "SPREAD" : "FLIP"));
      step.note = text(current ? "4 hướng." : "O → biên?", current ? "4 directions." : "O → edge?");
    }
  }
  return result;
}

function buildSteps130Bfs(input) {
  const result = buildBoundaryFlood(input, {
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
      // Show the LIVE board value so 'S' is visible exactly when line 11
      // (board[row][col] = 'S') runs, instead of masking it back to "O".
      if (value === "X") return { label: "X", cls: "wall" };
      if (value === "S") return { label: "S", cls: "path" };
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
  return decorateSurroundedRegionsResult(result, "S", 1);
}

/**
 * LeetCode 130 Approach 2: Recursive DFS from every border cell.
 * Mark border-connected 'O' as '#' first, then in one final pass flip
 * remaining 'O' → 'X' (captured) and '#' → 'O' (restored / safe).
 *
 * code2 lines (1-indexed):
 *  1  class Solution:
 *  2      def solve(self, board):
 *  3          ROWS, COLS = len(board), len(board[0])
 *  4          def dfs(r, c):
 *  5              if r < 0 or c < 0 or r >= ROWS or c >= COLS:
 *  6                  return
 *  7              if board[r][c] != 'O':
 *  8                  return
 *  9              board[r][c] = '#'
 * 10              dfs(r+1, c)
 * 11              dfs(r-1, c)
 * 12              dfs(r, c+1)
 * 13              dfs(r, c-1)
 * 14          for c in range(COLS):
 * 15              dfs(0, c)
 * 16              dfs(ROWS-1, c)
 * 17          for r in range(ROWS):
 * 18              dfs(r, 0)
 * 19              dfs(r, COLS-1)
 * 20          for r in range(ROWS):
 * 21              for c in range(COLS):
 * 22                  if board[r][c] == 'O':
 * 23                      board[r][c] = 'X'
 * 24                  elif board[r][c] == '#':
 * 25                      board[r][c] = 'O'
 */
function buildSteps130Dfs(input) {
  const parsed = parseGrid(input, new Set(["X", "O"]));
  const original = parsed.grid.map((row) => [...row]);
  if (!parsed.valid) {
    return invalidResult(original, text("Board phải là ma trận chữ nhật chỉ gồm X và O.", "The board must be rectangular and contain only X and O."));
  }
  const board = original.map((row) => [...row]);
  const ROWS = board.length;
  const COLS = board[0].length;
  const steps = [];

  // Call stack of "dfs(r,c)" frames, mirrors the recursive Python call stack.
  const callStack = [];
  const stackText = () => (callStack.length ? callStack.join(" → ") : "∅");

  function makeCells(cur) {
    return board.map((row, r) => row.map((v, c) => {
      let cls = v === "X" ? "wall" : v === "#" ? "queued" : "empty";
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      return { label: v, cls };
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title, arr: [], codeBlock: 2,
      bfsGrid: { rows: ROWS, cols: COLS, cells: makeCells(o.cur || null) },
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

  // ── Line 3 ──────────────────────────────────────────────────────────
  snap({
    title: { vi: "ROWS, COLS = len(board), len(board[0])", en: "ROWS, COLS = len(board), len(board[0])" },
    codeLines: [3],
    vars: [{ name: "ROWS", value: ROWS }, { name: "COLS", value: COLS }],
    note: {
      vi: `Board ${ROWS}×${COLS}. Ý tưởng: DFS từ MỌI ô 'O' trên biên, đánh dấu '#' cho các ô an toàn (nối tới biên). Cuối cùng: 'O' còn lại → 'X' (bị bao); '#' → 'O' (khôi phục).`,
      en: `Board ${ROWS}×${COLS}. Idea: DFS from EVERY border 'O', marking safe (border-connected) cells '#'. Finally: remaining 'O' → 'X' (captured); '#' → 'O' (restored).`,
    },
  });

  function dfs(r, c) {
    callStack.push(`dfs(${r},${c})`);

    // ── Line 5: boundary guard ───────────────────────────────────────
    const oob = r < 0 || c < 0 || r >= ROWS || c >= COLS;
    snap({
      title: { vi: `dfs(${r},${c}) — line 5: kiểm tra biên`, en: `dfs(${r},${c}) — line 5: boundary check` },
      cur: oob ? null : [r, c], codeLines: [5],
      vars: [
        { name: "r, c", value: `${r}, ${c}` },
        { name: "out of bounds?", value: oob },
      ],
      note: {
        vi: oob ? `(${r},${c}) nằm NGOÀI board → line 6 return.` : `(${r},${c}) nằm trong board → sang line 7.`,
        en: oob ? `(${r},${c}) is OUTSIDE the board → line 6 return.` : `(${r},${c}) is inside the board → go to line 7.`,
      },
    });
    if (oob) {
      snap({
        title: { vi: "line 6: return (ngoài biên)", en: "line 6: return (out of bounds)" },
        codeLines: [6],
        vars: [],
        note: { vi: "Ô ngoài board, không làm gì cả.", en: "Cell is outside the board, do nothing." },
      });
      callStack.pop();
      return;
    }

    // ── Line 7: not 'O' guard ────────────────────────────────────────
    const notO = board[r][c] !== "O";
    snap({
      title: { vi: `dfs(${r},${c}) — line 7: board[r][c] != 'O'?`, en: `dfs(${r},${c}) — line 7: board[r][c] != 'O'?` },
      cur: [r, c], codeLines: [7],
      vars: [
        { name: "board[r][c]", value: board[r][c] },
        { name: "not 'O'?", value: notO },
      ],
      note: {
        vi: notO
          ? `board[${r}][${c}] = '${board[r][c]}' (là 'X' hoặc đã là '#' — đã thăm) → line 8 return.`
          : `board[${r}][${c}] = 'O' chưa thăm → sang line 9 để đánh dấu.`,
        en: notO
          ? `board[${r}][${c}] = '${board[r][c]}' (either 'X' or already '#' — visited) → line 8 return.`
          : `board[${r}][${c}] = 'O' unvisited → go to line 9 to mark it.`,
      },
    });
    if (notO) {
      snap({
        title: { vi: "line 8: return ('X' hoặc đã thăm)", en: "line 8: return ('X' or already visited)" },
        cur: [r, c], codeLines: [8],
        vars: [],
        note: { vi: "Không phải 'O' chưa thăm — dừng nhánh đệ quy này.", en: "Not an unvisited 'O' — stop this recursive branch." },
      });
      callStack.pop();
      return;
    }

    // ── Line 9: mark visited in-place ────────────────────────────────
    const before = board.map((row) => row.join("")).join(" | ");
    board[r][c] = "#";
    const after = board.map((row) => row.join("")).join(" | ");
    snap({
      title: { vi: `line 9: board[${r}][${c}] = '#'  ⟵ 'O' bị ghi thành '#'`, en: `line 9: board[${r}][${c}] = '#'  ⟵ 'O' overwritten to '#'` },
      cur: [r, c], codeLines: [9],
      vars: [
        { name: "board[r][c] trước", value: "O" },
        { name: "board[r][c] sau", value: "#" },
        { name: "board trước", value: before },
        { name: "board sau", value: after },
      ],
      note: {
        vi: `Đánh dấu (${r},${c}) là AN TOÀN (nối tới biên). '#' đóng vai trò visited-marker, giống 'S' ở cách BFS.\nboard: ${before}  →  ${after}`,
        en: `Mark (${r},${c}) as SAFE (border-connected). '#' acts as the visited marker, similar to 'S' in the BFS approach.\nboard: ${before}  →  ${after}`,
      },
    });

    // ── Lines 10–13: recurse in 4 directions ─────────────────────────
    const DIRS = [
      { dr: 1, dc: 0, line: 10, label: "dfs(r+1, c)" },
      { dr: -1, dc: 0, line: 11, label: "dfs(r-1, c)" },
      { dr: 0, dc: 1, line: 12, label: "dfs(r, c+1)" },
      { dr: 0, dc: -1, line: 13, label: "dfs(r, c-1)" },
    ];
    for (const { dr, dc, line, label } of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      snap({
        title: { vi: `line ${line}: gọi ${label} → dfs(${nr},${nc})`, en: `line ${line}: call ${label} → dfs(${nr},${nc})` },
        cur: [r, c], codeLines: [line],
        vars: [{ name: "calling", value: `dfs(${nr},${nc})` }],
        note: { vi: `Đẩy frame dfs(${nr},${nc}) lên call stack.`, en: `Push frame dfs(${nr},${nc}) onto the call stack.` },
      });
      dfs(nr, nc);
      snap({
        title: { vi: `line ${line}: ${label} trả về (void) → quay lại dfs(${r},${c})`, en: `line ${line}: ${label} returned (void) → back in dfs(${r},${c})` },
        cur: [r, c], codeLines: [line],
        vars: [],
        note: { vi: `Pop frame khỏi call stack, tiếp tục dfs(${r},${c}).`, en: `Pop the frame off the call stack, resume dfs(${r},${c}).` },
      });
    }
    callStack.pop();
  }

  // ── Lines 14–16: top/bottom rows ─────────────────────────────────────
  for (let c = 0; c < COLS; c++) {
    snap({
      title: { vi: `line 14: for c in range(COLS) → c = ${c}`, en: `line 14: for c in range(COLS) → c = ${c}` },
      codeLines: [14],
      vars: [{ name: "c", value: c }],
      note: { vi: `Quét cột ${c} cho hàng trên/dưới.`, en: `Scan column ${c} for the top/bottom rows.` },
    });
    snap({
      title: { vi: `line 15: dfs(0, ${c})`, en: `line 15: dfs(0, ${c})` },
      cur: [0, c], codeLines: [15],
      vars: [],
      note: { vi: `Bắt đầu DFS từ hàng TRÊN, cột ${c}.`, en: `Start DFS from the TOP row, column ${c}.` },
    });
    dfs(0, c);
    snap({
      title: { vi: `line 16: dfs(${ROWS - 1}, ${c})`, en: `line 16: dfs(${ROWS - 1}, ${c})` },
      cur: [ROWS - 1, c], codeLines: [16],
      vars: [],
      note: { vi: `Bắt đầu DFS từ hàng DƯỚI, cột ${c}.`, en: `Start DFS from the BOTTOM row, column ${c}.` },
    });
    dfs(ROWS - 1, c);
  }

  // ── Lines 17–19: left/right cols ──────────────────────────────────────
  for (let r = 0; r < ROWS; r++) {
    snap({
      title: { vi: `line 17: for r in range(ROWS) → r = ${r}`, en: `line 17: for r in range(ROWS) → r = ${r}` },
      codeLines: [17],
      vars: [{ name: "r", value: r }],
      note: { vi: `Quét hàng ${r} cho cột trái/phải.`, en: `Scan row ${r} for the left/right columns.` },
    });
    snap({
      title: { vi: `line 18: dfs(${r}, 0)`, en: `line 18: dfs(${r}, 0)` },
      cur: [r, 0], codeLines: [18],
      vars: [],
      note: { vi: `Bắt đầu DFS từ hàng ${r}, cột TRÁI.`, en: `Start DFS from row ${r}, LEFT column.` },
    });
    dfs(r, 0);
    snap({
      title: { vi: `line 19: dfs(${r}, ${COLS - 1})`, en: `line 19: dfs(${r}, ${COLS - 1})` },
      cur: [r, COLS - 1], codeLines: [19],
      vars: [],
      note: { vi: `Bắt đầu DFS từ hàng ${r}, cột PHẢI.`, en: `Start DFS from row ${r}, RIGHT column.` },
    });
    dfs(r, COLS - 1);
  }

  // ── Lines 20–25: final pass ───────────────────────────────────────────
  for (let r = 0; r < ROWS; r++) {
    snap({
      title: { vi: `line 20: for r in range(ROWS) → r = ${r}`, en: `line 20: for r in range(ROWS) → r = ${r}` },
      codeLines: [20],
      vars: [{ name: "r", value: r }],
      note: { vi: `Quét hàng ${r} để capture/restore.`, en: `Scan row ${r} to capture/restore.` },
    });
    for (let c = 0; c < COLS; c++) {
      snap({
        title: { vi: `line 21: for c in range(COLS) → c = ${c}`, en: `line 21: for c in range(COLS) → c = ${c}` },
        cur: [r, c], codeLines: [21],
        vars: [{ name: "board[r][c]", value: board[r][c] }],
        note: { vi: `Xét ô (${r},${c}) = '${board[r][c]}'.`, en: `Inspect cell (${r},${c}) = '${board[r][c]}'.` },
      });
      const isO = board[r][c] === "O";
      snap({
        title: { vi: `line 22: board[${r}][${c}] == 'O'? → ${isO}`, en: `line 22: board[${r}][${c}] == 'O'? → ${isO}` },
        cur: [r, c], codeLines: [22],
        vars: [{ name: "is 'O'?", value: isO }],
        note: {
          vi: isO ? `'O' không nối biên → BỊ BAO QUANH → line 23 đổi thành 'X'.` : `Không phải 'O' → kiểm tra '#' ở line 24.`,
          en: isO ? `'O' is not border-connected → SURROUNDED → line 23 flips it to 'X'.` : `Not 'O' → check '#' at line 24.`,
        },
      });
      if (isO) {
        board[r][c] = "X";
        snap({
          title: { vi: `line 23: board[${r}][${c}] = 'X'  ⟵ 'O' bị bắt`, en: `line 23: board[${r}][${c}] = 'X'  ⟵ 'O' captured` },
          cur: [r, c], codeLines: [23],
          vars: [{ name: "board[r][c]", value: "X" }],
          note: { vi: `Ô (${r},${c}) bị bao quanh hoàn toàn → đổi thành 'X'.`, en: `Cell (${r},${c}) is fully surrounded → flip to 'X'.` },
        });
        continue;
      }
      const isHash = board[r][c] === "#";
      snap({
        title: { vi: `line 24: elif board[${r}][${c}] == '#'? → ${isHash}`, en: `line 24: elif board[${r}][${c}] == '#'? → ${isHash}` },
        cur: [r, c], codeLines: [24],
        vars: [{ name: "is '#'?", value: isHash }],
        note: {
          vi: isHash ? `'#' (an toàn, nối biên) → line 25 khôi phục thành 'O'.` : `board[${r}][${c}] = '${board[r][c]}' (vẫn là 'X') → không đổi.`,
          en: isHash ? `'#' (safe, border-connected) → line 25 restores it to 'O'.` : `board[${r}][${c}] = '${board[r][c]}' (still 'X') → unchanged.`,
        },
      });
      if (isHash) {
        board[r][c] = "O";
        snap({
          title: { vi: `line 25: board[${r}][${c}] = 'O'  ⟵ '#' được khôi phục`, en: `line 25: board[${r}][${c}] = 'O'  ⟵ '#' restored` },
          cur: [r, c], codeLines: [25],
          vars: [{ name: "board[r][c]", value: "O" }],
          note: { vi: `Ô (${r},${c}) an toàn → khôi phục lại 'O'.`, en: `Cell (${r},${c}) is safe → restore it to 'O'.` },
        });
      }
    }
  }

  const answer = board.map((row) => [...row]);
  snap({
    title: { vi: "Hoàn tất — board đã được cập nhật in-place", en: "Done — board updated in place" },
    final: true, codeLines: [22, 23, 24, 25],
    vars: [{ name: "answer", value: answer.map((row) => row.join("")).join(" | ") }],
    note: {
      vi: `Hoàn tất: mọi 'O' bị bao quanh đã thành 'X'; các vùng an toàn được khôi phục về 'O'. (Hàm sửa board in-place, không cần return.)`,
      en: `Done: every surrounded 'O' became 'X'; safe regions were restored to 'O'. (The function mutates board in place, no return needed.)`,
    },
  });

  return decorateSurroundedRegionsResult({ original, answer, steps }, "#", 2);
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

function buildSteps1020Dfs(input) {
  const parsed = parseGrid(input, new Set(["0", "1"]));
  const original = parsed.grid.map((row) => row.map(Number));
  if (!parsed.valid) {
    return {
      original,
      answer: null,
      steps: [{ title: text("Đầu vào không hợp lệ", "Invalid input"), arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] }, highlight: [], mark: [], final: true, codeBlock: 2, codeLines: [2], vars: [], note: text("Grid phải là ma trận chữ nhật chỉ gồm 0 và 1.", "Grid must be rectangular and contain only 0 and 1.") }],
    };
  }
  const grid = original.map((row) => [...row]);
  const rows = grid.length;
  const cols = grid[0].length;
  const steps = [];
  const stack = [];

  function cells(current = null, discovered = null) {
    return original.map((row, r) => row.map((value, c) => {
      let cls = value === 0 ? "wall" : (grid[r][c] === 0 ? "path" : "empty");
      if (discovered && discovered[0] === r && discovered[1] === c) cls = "queued";
      if (current && current[0] === r && current[1] === c) cls = "current";
      return { label: value ? "1" : "", cls };
    }));
  }
  function snap(codeLine, title, note, options = {}) {
    steps.push({
      title, arr: [], bfsGrid: { rows, cols, cells: cells(options.current, options.discovered) }, highlight: [], mark: [],
      final: Boolean(options.final), codeBlock: 2, codeLines: [codeLine],
      vars: [
        { name: "call stack", value: `[${stack.map(([r, c]) => `(${r},${c})`).join(" → ")}]` },
        ...(options.vars || []),
      ],
      note,
    });
  }

  snap(3, text(`ROWS=${rows}, COLS=${cols}`, `ROWS=${rows}, COLS=${cols}`), text("Lưu kích thước grid trước khi DFS.", "Store grid dimensions before DFS."));
  const calls = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function dfs(r, c) {
    stack.push([r, c]);
    snap(4, text(`Vào dfs(${r},${c})`, `Enter dfs(${r},${c})`), text("DFS chỉ xóa đất nối được với biên.", "DFS only erases land reachable from the boundary."), { current: r >= 0 && r < rows && c >= 0 && c < cols ? [r, c] : null });
    const outside = r < 0 || r >= rows || c < 0 || c >= cols;
    snap(5, text(`Kiểm tra ngoài biên → ${outside}`, `Check out of bounds → ${outside}`), outside ? text("Tọa độ nằm ngoài grid.", "The coordinate is outside the grid.") : text("Tọa độ vẫn nằm trong grid.", "The coordinate is inside the grid."), { current: outside ? null : [r, c] });
    if (outside) {
      snap(6, text("return (ngoài biên)", "return (out of bounds)"), text("Dừng nhánh DFS này.", "Stop this DFS branch."));
      stack.pop();
      return;
    }
    const waterOrSeen = grid[r][c] === 0;
    snap(7, text(`grid[${r}][${c}] == 0 → ${waterOrSeen}`, `grid[${r}][${c}] == 0 → ${waterOrSeen}`), waterOrSeen ? text("Là nước hoặc đất an toàn đã xóa.", "It is water or already-erased safe land.") : text("Đây là đất chưa thăm.", "This is unvisited land."), { current: [r, c] });
    if (waterOrSeen) {
      snap(8, text("return (water / seen)", "return (water / seen)"), text("Không thể lan DFS qua ô này.", "DFS cannot spread through this cell."), { current: [r, c] });
      stack.pop();
      return;
    }
    grid[r][c] = 0;
    snap(9, text(`grid[${r}][${c}] = 0`, `grid[${r}][${c}] = 0`), text("Đánh dấu đất nối biên là an toàn (không phải enclave).", "Mark boundary-connected land as safe (not an enclave)."), { current: [r, c], discovered: [r, c] });
    calls.forEach(([dr, dc], index) => {
      const nr = r + dr;
      const nc = c + dc;
      const codeLine = 10 + index;
      snap(codeLine, text(`dfs(${nr},${nc})`, `dfs(${nr},${nc})`), text("Đệ quy sang một trong bốn ô kề cạnh.", "Recurse into one of four orthogonal neighbors."), { current: [r, c] });
      dfs(nr, nc);
    });
    stack.pop();
  }

  for (let r = 0; r < rows; r++) {
    snap(14, text(`for r in range(ROWS): r=${r}`, `for r in range(ROWS): r=${r}`), text("Gọi DFS tại hai biên trái/phải của hàng.", "Call DFS at the row's left and right boundaries."), { vars: [{ name: "r", value: r }] });
    snap(15, text(`dfs(${r}, 0)`, `dfs(${r}, 0)`), text("Kiểm tra ô biên trái.", "Inspect the left boundary cell."), { current: [r, 0] });
    dfs(r, 0);
    snap(16, text(`dfs(${r}, ${cols - 1})`, `dfs(${r}, ${cols - 1})`), text("Kiểm tra ô biên phải.", "Inspect the right boundary cell."), { current: [r, cols - 1] });
    dfs(r, cols - 1);
  }
  for (let c = 0; c < cols; c++) {
    snap(17, text(`for c in range(COLS): c=${c}`, `for c in range(COLS): c=${c}`), text("Gọi DFS tại hai biên trên/dưới của cột.", "Call DFS at the column's top and bottom boundaries."), { vars: [{ name: "c", value: c }] });
    snap(18, text(`dfs(0, ${c})`, `dfs(0, ${c})`), text("Kiểm tra ô biên trên.", "Inspect the top boundary cell."), { current: [0, c] });
    dfs(0, c);
    snap(19, text(`dfs(${rows - 1}, ${c})`, `dfs(${rows - 1}, ${c})`), text("Kiểm tra ô biên dưới.", "Inspect the bottom boundary cell."), { current: [rows - 1, c] });
    dfs(rows - 1, c);
  }
  const answer = grid.flat().reduce((sum, value) => sum + value, 0);
  snap(20, text(`return sum(grid) → ${answer}`, `return sum(grid) → ${answer}`), text("Các ô đất còn lại không nối được biên, chính là enclave.", "The remaining land cannot reach the boundary, so it is enclave land."), { final: true, vars: [{ name: "enclaves", value: answer }] });
  return { original, answer, steps };
}

function buildSteps1020UnionFind(input) {
  const parsed = parseGrid(input, new Set(["0", "1"]));
  const original = parsed.grid.map((row) => row.map(Number));
  if (!parsed.valid) {
    return {
      original,
      answer: null,
      steps: [{ title: text("Đầu vào không hợp lệ", "Invalid input"), arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] }, highlight: [], mark: [], final: true, codeBlock: 3, codeLines: [2], vars: [], note: text("Grid phải là ma trận chữ nhật chỉ gồm 0 và 1.", "Grid must be rectangular and contain only 0 and 1.") }],
    };
  }
  const rows = original.length;
  const cols = original[0].length;
  const virtual = rows * cols;
  const parent = Array.from({ length: virtual + 1 }, (_, index) => index);
  const steps = [];
  const id = (r, c) => r * cols + c;
  const coord = (node) => node === virtual ? "BORDER" : `(${Math.floor(node / cols)},${node % cols})`;
  function find(node) {
    while (parent[node] !== node) {
      parent[node] = parent[parent[node]];
      node = parent[node];
    }
    return node;
  }
  function cells(current = null, discovered = null) {
    const borderRoot = find(virtual);
    return original.map((row, r) => row.map((value, c) => {
      let cls = "wall";
      if (value === 1) cls = find(id(r, c)) === borderRoot ? "path" : "empty";
      if (discovered && discovered[0] === r && discovered[1] === c) cls = "queued";
      if (current && current[0] === r && current[1] === c) cls = "current";
      return { label: value ? "1" : "", cls };
    }));
  }
  function snap(codeLine, title, note, options = {}) {
    steps.push({
      title, arr: [], bfsGrid: { rows, cols, cells: cells(options.current, options.discovered) }, highlight: [], mark: [],
      final: Boolean(options.final), codeBlock: 3, codeLines: [codeLine],
      vars: [
        { name: "virtual BORDER", value: virtual },
        { name: "BORDER root", value: find(virtual) },
        ...(options.vars || []),
      ],
      note,
    });
  }
  function union(a, b, callLine, current, reason) {
    snap(callLine, text(`union(${coord(a)}, ${coord(b)})`, `union(${coord(a)}, ${coord(b)})`), reason, { current, vars: [{ name: "union", value: `${a} ↔ ${b}` }] });
    const rootA = find(a);
    const rootB = find(b);
    snap(11, text(`root_a=${rootA}, root_b=${rootB}`, `root_a=${rootA}, root_b=${rootB}`), text("Tìm hai component đại diện trước khi gộp.", "Find the two component representatives before merging."), { current, vars: [{ name: "root_a", value: rootA }, { name: "root_b", value: rootB }] });
    if (rootA === rootB) {
      snap(12, text("root_a == root_b → return", "root_a == root_b → return"), text("Hai node đã cùng component; không cần union lại.", "The nodes already share a component; no union is needed."), { current });
      return;
    }
    parent[rootB] = rootA;
    snap(13, text(`parent[${rootB}] = ${rootA}`, `parent[${rootB}] = ${rootA}`), text("Gộp component root_b vào root_a.", "Attach root_b's component to root_a."), { current, vars: [{ name: `parent[${rootB}]`, value: rootA }] });
  }

  snap(3, text(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), text("Lưu kích thước grid.", "Store grid dimensions."));
  snap(4, text(`virtual = rows * cols = ${virtual}`, `virtual = rows * cols = ${virtual}`), text("Node ảo BORDER đại diện cho mọi đất nối được với biên.", "The virtual BORDER node represents every land cell connected to the boundary."));
  snap(5, text(`parent = [0..${virtual}]`, `parent = [0..${virtual}]`), text("Ban đầu mỗi ô đất và BORDER là component riêng.", "Initially every land cell and BORDER are separate components."));

  for (let r = 0; r < rows; r++) {
    snap(14, text(`for r: r=${r}`, `for r: r=${r}`), text("Duyệt từng hàng để tạo các component đất.", "Scan each row to build land components."), { vars: [{ name: "r", value: r }] });
    for (let c = 0; c < cols; c++) {
      const land = original[r][c] === 1;
      snap(15, text(`for c: c=${c}`, `for c: c=${c}`), text("Xét một ô trong hàng hiện tại.", "Inspect one cell in the current row."), { current: [r, c], vars: [{ name: "c", value: c }] });
      snap(16, text(`grid[${r}][${c}] == 1 → ${land}`, `grid[${r}][${c}] == 1 → ${land}`), land ? text("Đây là đất; xét các union cần thiết.", "This is land; inspect required unions.") : text("Đây là nước; bỏ qua.", "This is water; skip it."), { current: [r, c] });
      if (!land) continue;
      const node = id(r, c);
      const border = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      snap(17, text(`is_border(${r},${c}) → ${border}`, `is_border(${r},${c}) → ${border}`), border ? text("Đất biên phải nối với BORDER ảo.", "Boundary land must connect to virtual BORDER.") : text("Không phải đất biên.", "This is not boundary land."), { current: [r, c] });
      if (border) union(node, virtual, 18, [r, c], text("Nối đất biên với component BORDER.", "Connect boundary land to the BORDER component."));
      const downLand = r + 1 < rows && original[r + 1][c] === 1;
      snap(19, text(`down là land → ${downLand}`, `down is land → ${downLand}`), text("Chỉ xét down và right để không union trùng cạnh.", "Only inspect down and right to avoid duplicate edge unions."), { current: [r, c] });
      if (downLand) union(node, id(r + 1, c), 20, [r, c], text("Gộp hai ô đất kề nhau theo chiều dọc.", "Merge vertically adjacent land cells."));
      const rightLand = c + 1 < cols && original[r][c + 1] === 1;
      snap(21, text(`right là land → ${rightLand}`, `right is land → ${rightLand}`), text("Kiểm tra neighbor bên phải.", "Inspect the right neighbor."), { current: [r, c] });
      if (rightLand) union(node, id(r, c + 1), 22, [r, c], text("Gộp hai ô đất kề nhau theo chiều ngang.", "Merge horizontally adjacent land cells."));
    }
  }
  const borderRoot = find(virtual);
  snap(23, text(`border_root = find(BORDER) → ${borderRoot}`, `border_root = find(BORDER) → ${borderRoot}`), text("Mọi đất có root này đều có đường ra biên.", "Every land cell with this root can reach the boundary."), { vars: [{ name: "border_root", value: borderRoot }] });
  let enclaves = 0;
  snap(24, text("enclaves = 0", "enclaves = 0"), text("Bắt đầu đếm các đất không nối BORDER.", "Start counting land that is not connected to BORDER."));
  for (let r = 0; r < rows; r++) {
    snap(25, text(`for r: r=${r}`, `for r: r=${r}`), text("Duyệt lại để đếm enclave.", "Scan again to count enclaves."), { vars: [{ name: "r", value: r }] });
    for (let c = 0; c < cols; c++) {
      snap(26, text(`for c: c=${c}`, `for c: c=${c}`), text("Xét một ô để đếm.", "Inspect one cell for counting."), { current: [r, c] });
      const enclave = original[r][c] === 1 && find(id(r, c)) !== borderRoot;
      snap(27, text(`land và root != BORDER → ${enclave}`, `land and root != BORDER → ${enclave}`), enclave ? text("Ô đất này bị bao kín; tăng kết quả.", "This land cell is enclosed; increment the result.") : text("Là nước hoặc nối được biên; không đếm.", "It is water or reaches the boundary; do not count it."), { current: [r, c] });
      if (enclave) {
        enclaves++;
        snap(28, text(`enclaves += 1 → ${enclaves}`, `enclaves += 1 → ${enclaves}`), text("Đếm thêm một ô enclave.", "Count one more enclave cell."), { current: [r, c], discovered: [r, c] });
      }
    }
  }
  snap(29, text(`return enclaves → ${enclaves}`, `return enclaves → ${enclaves}`), text("Trả về số ô đất không nối với BORDER.", "Return the number of land cells not connected to BORDER."), { final: true, vars: [{ name: "enclaves", value: enclaves }] });
  return { original, answer: enclaves, steps };
}

const graphCategory = { key: "graph", vi: "Đồ thị", en: "Graph" };
const multiSourceTag = { key: "multi-source-bfs", vi: "Multi-source BFS", en: "Multi-source BFS" };
const floodFillTag = { key: "flood-fill", vi: "Flood Fill", en: "Flood Fill" };

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
    debugMode: "line-by-line",
    approach: [
      text("Đưa tất cả ô đất vào queue làm nguồn BFS.", "Put every land cell in the queue as a BFS source."),
      text("Xử lý trọn từng lớp queue rồi tăng distance.", "Process one complete queue layer, then increase distance."),
      text("Đổi biển đã thăm thành 1 để không enqueue lại.", "Turn visited water into 1 so it cannot be enqueued again."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Mỗi ô được enqueue tối đa một lần.", "Each cell is enqueued at most once.") },
    code: [
      "from collections import deque",
      "from typing import List",
      "",
      "class Solution:",
      "    def maxDistance(self, grid: List[List[int]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        queue = deque()",
      "",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] == 1:",
      "                    queue.append((row, col))",
      "",
      "        if not queue or len(queue) == rows * cols:",
      "            return -1",
      "",
      "        directions = [(1, 0), (-1, 0),",
      "                      (0, 1), (0, -1)]",
      "",
      "        distance = -1",
      "",
      "        while queue:",
      "            distance += 1",
      "",
      "            for _ in range(len(queue)):",
      "                row, col = queue.popleft()",
      "",
      "                for dr, dc in directions:",
      "                    nr, nc = row + dr, col + dc",
      "",
      "                    if (0 <= nr < rows and",
      "                        0 <= nc < cols and",
      "                        grid[nr][nc] == 0):",
      "",
      "                        grid[nr][nc] = 1",
      "                        queue.append((nr, nc))",
      "",
      "        return distance",
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
    debugMode: "line-by-line",
    approach: [
      text("💧 Mọi ô nước cùng vào queue ở độ cao 0.", "💧 All water cells enter the queue at height 0."),
      text("🌊 Sóng BFS lan đồng thời theo 4 hướng.", "🌊 BFS waves expand together in four directions."),
      text("⛰️ Mỗi bước xa nước làm độ cao tăng 1.", "⛰️ Each step away from water raises the height by 1."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Mỗi ô được xử lý đúng một lần.", "Each cell is processed once.") },
    code: [
      "from collections import deque",
      "from typing import List",
      "",
      "class Solution:",
      "    def highestPeak(self, isWater: List[List[int]]) -> List[List[int]]:",
      "        rows, cols = len(isWater), len(isWater[0])",
      "",
      "        heights = [[-1] * cols for _ in range(rows)]",
      "        queue = deque()",
      "",
      "        # Step 1: Add all water cells to the queue",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if isWater[row][col] == 1:",
      "                    heights[row][col] = 0",
      "                    queue.append((row, col))",
      "",
      "        directions = [(1, 0), (-1, 0),",
      "                      (0, 1), (0, -1)]",
      "",
      "        # Step 2: Multi-source BFS",
      "        while queue:",
      "            row, col = queue.popleft()",
      "",
      "            for dr, dc in directions:",
      "                nr, nc = row + dr, col + dc",
      "",
      "                if (0 <= nr < rows and",
      "                    0 <= nc < cols and",
      "                    heights[nr][nc] == -1):",
      "",
      "                    heights[nr][nc] = heights[row][col] + 1",
      "                    queue.append((nr, nc))",
      "",
      "        return heights",
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
    debugMode: "line-by-line",
    approach: [
      text("🚪 Mọi gate cùng vào queue ở khoảng cách 0.", "🚪 Every gate enters the queue at distance 0."),
      text("〰️ BFS lan qua phòng trống; 🧱 chặn đường.", "〰️ BFS spreads through empty rooms; 🧱 blocks the way."),
      text("🏠 Lần chạm đầu tiên là gate gần nhất.", "🏠 The first arrival comes from the nearest gate."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Một lần multi-source BFS thay cho BFS riêng từ từng phòng.", "One multi-source BFS replaces a separate BFS from every room.") },
    code: [
      "from collections import deque",
      "from typing import List",
      "",
      "class Solution:",
      "    def wallsAndGates(self, rooms: List[List[int]]) -> None:",
      "        if not rooms or not rooms[0]:",
      "            return",
      "",
      "        rows, cols = len(rooms), len(rooms[0])",
      "        INF = 2147483647",
      "        queue = deque()",
      "",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if rooms[row][col] == 0:",
      "                    queue.append((row, col))",
      "",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "",
      "        while queue:",
      "            row, col = queue.popleft()",
      "",
      "            for delta_row, delta_col in directions:",
      "                next_row = row + delta_row",
      "                next_col = col + delta_col",
      "",
      "                if (0 <= next_row < rows and",
      "                    0 <= next_col < cols and",
      "                    rooms[next_row][next_col] == INF):",
      "",
      "                    rooms[next_row][next_col] = rooms[row][col] + 1",
      "                    queue.append((next_row, next_col))",
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
    tags: [multiSourceTag, floodFillTag],
    title: text("Surrounded Regions", "Surrounded Regions"),
    titleVi: text("Giữ O nối biên, lật O bị bao kín", "Keep border O, flip enclosed O"),
    statement: text("O chạm được biên thì giữ. O bị khóa kín thì đổi thành X.", "Keep O cells that reach an edge. Flip enclosed O cells to X."),
    defaultInput: "XXXX|XOOX|XXOX|XOXX",
    inputKind: "string",
    inputLabel: text("Board X/O (hàng cách '|')", "X/O board (rows separated by '|')"),
    extraParams: [
      {
        key: "approach",
        label: text("Cách giải", "Approach"),
        type: "select",
        default: "1",
        options: [
          { value: "1", label: text("Cách 1: Multi-source BFS", "Approach 1: Multi-source BFS") },
          { value: "2", label: text("Cách 2: DFS đệ quy từ biên", "Approach 2: Recursive DFS from the border") },
        ],
      },
    ],
    approach: [
      text("Bắt đầu từ mọi O ở biên.", "Start from every border O."),
      text("Lan 4 hướng, đánh dấu vùng an toàn.", "Spread in 4 directions and mark safe cells."),
      text("O chưa đánh dấu → X. Vùng an toàn → O.", "Unmarked O → X. Safe cells → O."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("Mỗi ô được quét hằng số lần; BFS dùng queue, DFS dùng call stack đệ quy.", "Each cell is scanned a constant number of times; BFS uses a queue, DFS uses the recursive call stack.") },
    codeLabel: text("Cách 1: Multi-source BFS", "Approach 1: Multi-source BFS"),
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
    code2Label: text("Cách 2: DFS đệ quy từ biên", "Approach 2: Recursive DFS from the border"),
    code2: [
      "class Solution:",
      "    def solve(self, board):",
      "        ROWS, COLS = len(board), len(board[0])",
      "        def dfs(r, c):",
      "            if r < 0 or c < 0 or r >= ROWS or c >= COLS:",
      "                return",
      "            if board[r][c] != 'O':",
      "                return",
      "            board[r][c] = '#'",
      "            dfs(r+1, c)",
      "            dfs(r-1, c)",
      "            dfs(r, c+1)",
      "            dfs(r, c-1)",
      "        for c in range(COLS):",
      "            dfs(0, c)",
      "            dfs(ROWS-1, c)",
      "        for r in range(ROWS):",
      "            dfs(r, 0)",
      "            dfs(r, COLS-1)",
      "        for r in range(ROWS):",
      "            for c in range(COLS):",
      "                if board[r][c] == 'O':",
      "                    board[r][c] = 'X'",
      "                elif board[r][c] == '#':",
      "                    board[r][c] = 'O'",
    ],
    builder: buildSteps130Bfs,
    builder2: buildSteps130Dfs,
  },
  1020: {
    id: 1020,
    difficulty: "medium",
    slug: "number-of-enclaves",
    tags: [multiSourceTag, floodFillTag],
    category: graphCategory,
    title: text("Number of Enclaves", "Number of Enclaves"),
    titleVi: text("Đếm đất không thể đi ra biên", "Count land that cannot reach the border"),
    statement: text("Trả về số ô đất không thể đi bộ theo bốn hướng tới biên grid.", "Return the number of land cells from which a four-directional walk cannot reach the grid boundary."),
    defaultInput: "0,0,0,0|1,0,1,0|0,1,1,0|0,0,0,0",
    inputKind: "string",
    inputLabel: text("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    extraParams: [
      {
        key: "approach",
        label: text("Cách giải", "Approach"),
        type: "select",
        default: "1",
        options: [
          { value: "1", label: text("Cách 1: Multi-source BFS", "Approach 1: Multi-source BFS") },
          { value: "2", label: text("Cách 2: DFS từ biên", "Approach 2: DFS from the boundary") },
          { value: "3", label: text("Cách 3: Union-Find + BORDER ảo", "Approach 3: Union-Find + virtual BORDER") },
        ],
      },
    ],
    approach: [
      text("Cách 1 (BFS): đưa mọi ô đất ở biên vào queue và xóa thành 0.", "Approach 1 (BFS): put every border land cell in a queue and erase it to 0."),
      text("Cách 2 (DFS): gọi DFS từ mọi đất biên để xóa toàn bộ vùng đất có thể đi tới biên.", "Approach 2 (DFS): call DFS from every border land cell to erase all land that can reach the boundary."),
      text("Cách 3 (Union-Find): nối đất biên với node BORDER ảo; đất không cùng component với BORDER là enclave.", "Approach 3 (Union-Find): connect boundary land to a virtual BORDER node; land outside BORDER's component is enclave land."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: text("BFS/DFS cần queue hoặc call stack; Union-Find dùng mảng parent cho mỗi ô và một node BORDER ảo.", "BFS/DFS use a queue or call stack; Union-Find uses a parent array for each cell plus one virtual BORDER node.") },
    codeLabel: text("Cách 1: Multi-source BFS", "Approach 1: Multi-source BFS"),
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
    code2Label: text("Cách 2: DFS đệ quy từ biên", "Approach 2: Recursive DFS from the boundary"),
    code2: [
      "class Solution:",
      "    def numEnclaves(self, grid):",
      "        ROWS, COLS = len(grid), len(grid[0])",
      "        def dfs(r, c):",
      "            if r < 0 or r >= ROWS or c < 0 or c >= COLS:",
      "                return",
      "            if grid[r][c] == 0:",
      "                return",
      "            grid[r][c] = 0",
      "            dfs(r + 1, c)",
      "            dfs(r - 1, c)",
      "            dfs(r, c + 1)",
      "            dfs(r, c - 1)",
      "        for r in range(ROWS):",
      "            dfs(r, 0)",
      "            dfs(r, COLS - 1)",
      "        for c in range(COLS):",
      "            dfs(0, c)",
      "            dfs(ROWS - 1, c)",
      "        return sum(map(sum, grid))",
    ],
    code3Label: text("Cách 3: Union-Find + BORDER ảo", "Approach 3: Union-Find + virtual BORDER"),
    code3: [
      "class Solution:",
      "    def numEnclaves(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        virtual = rows * cols",
      "        parent = list(range(virtual + 1))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]; x = parent[x]",
      "            return x",
      "        def union(a, b):",
      "            root_a, root_b = find(a), find(b)",
      "            if root_a == root_b: return",
      "            parent[root_b] = root_a",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if grid[r][c] == 1:",
      "                    if r in (0, rows-1) or c in (0, cols-1):",
      "                        union(r * cols + c, virtual)",
      "                    if r + 1 < rows and grid[r+1][c] == 1:",
      "                        union(r * cols + c, (r+1) * cols + c)",
      "                    if c + 1 < cols and grid[r][c+1] == 1:",
      "                        union(r * cols + c, r * cols + c + 1)",
      "        border_root = find(virtual)",
      "        enclaves = 0",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if grid[r][c] == 1 and find(r * cols + c) != border_root:",
      "                    enclaves += 1",
      "        return enclaves",
    ],
    builder: buildSteps1020,
    builder2: buildSteps1020Dfs,
    builder3: buildSteps1020UnionFind,
  },
};

module.exports = problems;
