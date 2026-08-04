// Detailed line-by-line visualizations for the Flood Fill learning path.

const tr = (vi, en) => ({ vi, en });
const floodFillTag = { key: "flood-fill", vi: "Flood Fill", en: "Flood Fill" };

function splitRows(input) {
  return String(input).split("|").map((row) => row.trim()).filter(Boolean)
    .map((row) => (row.includes(",") ? row.split(",") : row.split(""))
      .map((value) => value.trim().replace(/^"|"$/g, "")));
}

function parseBinary(input, asString = false) {
  const raw = splitRows(input);
  const valid = raw.length > 0 && raw[0].length > 0 && raw.every((row) =>
    row.length === raw[0].length && row.every((value) => value === "0" || value === "1")
  );
  return { valid, grid: raw.map((row) => row.map((value) => asString ? value : Number(value))) };
}

function parseNumbers(input) {
  const raw = splitRows(input);
  const valid = raw.length > 0 && raw[0].length > 0 && raw.every((row) =>
    row.length === raw[0].length && row.every((value) => /^-?\d+$/.test(value))
  );
  return { valid, grid: raw.map((row) => row.map(Number)) };
}

function invalid(original, note) {
  return { original, answer: [], steps: [{
    title: tr("Đầu vào không hợp lệ", "Invalid input"), arr: [],
    bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
    highlight: [], mark: [], final: true, codeLines: [4],
    vars: [{ name: "answer", value: "invalid" }], note,
  }] };
}

function stackText(stack) {
  return `[${stack.map(([row, col]) => `(${row},${col})`).join(", ")}]`;
}

function recorder(rows, cols, getCells, getStack) {
  const steps = [];
  function push(line, title, note, options = {}) {
    const vars = [...(options.vars || [])];
    if (!vars.some((item) => item.name === "stack")) vars.push({ name: "stack", value: stackText(getStack()) });
    const step = { title, arr: [], bfsGrid: { rows, cols, cells: getCells(options.current || null, options.discovered || null) },
      highlight: [], mark: [], final: Boolean(options.final), codeLines: [line], vars, note };
    if (options.floodFillView) step.floodFillView = options.floodFillView;
    steps.push(step);
  }
  return { steps, push };
}

function buildSteps733(input, params = {}) {
  const parsed = parseNumbers(input);
  const original = parsed.grid.map((row) => [...row]);
  if (!parsed.valid) return invalid(original, tr("Image phải là ma trận chữ nhật gồm số nguyên.", "Image must be a rectangular integer matrix."));
  const image = parsed.grid.map((row) => [...row]);
  const rows = image.length, cols = image[0].length;
  const startRow = Number(params.start_row ?? params.sr ?? 1);
  const startCol = Number(params.start_col ?? params.sc ?? 1);
  const color = Number(params.color ?? 2);
  if (!Number.isInteger(startRow) || !Number.isInteger(startCol) || !Number.isInteger(color) || startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) {
    return invalid(original, tr("start_row/start_col phải nằm trong image và color phải là số nguyên.", "start_row/start_col must be inside the image and color must be an integer."));
  }
  const originalColor = image[startRow][startCol];
  const directions = [[1,0],[-1,0],[0,1],[0,-1]];
  let stack = [];
  const changed = Array.from({ length: rows }, () => Array(cols).fill(false));
  let phase = "enter";
  let currentCell = null;
  let neighborCell = null;
  let activeDirection = null;
  let insideGrid = null;
  let matchesOriginal = null;
  let canFillNeighbor = null;
  let dimensionsKnown = false;
  let originalKnown = false;
  let directionsKnown = false;
  let stackKnown = false;
  function cells(current, discovered) {
    const queued = new Set(stack.map(([row,col]) => `${row},${col}`));
    return image.map((matrixRow,row) => matrixRow.map((value,col) => {
      let cls = changed[row][col] ? "visited" : "empty";
      if (queued.has(`${row},${col}`)) cls = "queued";
      if (discovered && discovered[0]===row && discovered[1]===col) cls="path";
      if (current && current[0]===row && current[1]===col) cls="current";
      return { label: String(value), cls };
    }));
  }
  const { steps, push: recordStep } = recorder(rows, cols, cells, () => stack);
  function push(line, title, note, options = {}) {
    const filledCount = changed.reduce((total, row) => total + row.filter(Boolean).length, 0);
    recordStep(line, title, note, {
      ...options,
      floodFillView: {
        phase,
        mode: "iterative",
        rows,
        cols,
        image: image.map((row) => [...row]),
        original: original.map((row) => [...row]),
        changed: changed.map((row) => [...row]),
        start: [startRow, startCol],
        current: currentCell ? [...currentCell] : null,
        neighbor: neighborCell ? [...neighborCell] : null,
        direction: activeDirection ? [...activeDirection] : null,
        insideGrid,
        matchesOriginal,
        canFill: canFillNeighbor,
        originalColor: originalKnown ? originalColor : null,
        newColor: color,
        dimensionsKnown,
        directionsKnown,
        stackKnown,
        stack: stack.map((cell) => [...cell]),
        filledCount,
      },
    });
  }
  push(4,tr("Bắt đầu floodFill","Enter floodFill"),tr("Tô toàn bộ component có cùng màu với ô bắt đầu.","Recolor the component matching the start cell."),{vars:[{name:"start",value:`(${startRow},${startCol})`},{name:"color",value:color}]});
  dimensionsKnown = true;
  phase = "dimensions";
  push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Lưu kích thước image.","Store image dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});
  originalKnown = true;
  currentCell = [startRow,startCol];
  phase = "read-color";
  push(6,tr(`original_color = ${originalColor}`,`original_color = ${originalColor}`),tr("Chỉ các ô nối liền có màu này mới được tô.","Only connected cells with this color are filled."),{current:[startRow,startCol],vars:[{name:"original_color",value:originalColor}]});
  const unchanged = originalColor === color;
  phase = "same-color-check";
  push(7,tr(`original_color == color → ${unchanged}`,`original_color == color → ${unchanged}`),unchanged?tr("Màu mới giống màu cũ; trả image ngay để tránh lặp vô hạn.","The new color matches the old one; return immediately."):tr("Màu khác nhau; tiếp tục DFS.","The colors differ; continue DFS."),{current:[startRow,startCol],vars:[{name:"same color?",value:unchanged}]});
  if (unchanged) { phase="done"; push(7,tr("return image","return image"),tr("Image không thay đổi.","The image is unchanged."),{final:true,vars:[{name:"answer",value:JSON.stringify(image)}]}); return {original,answer:image,steps}; }
  canFillNeighbor = null;
  currentCell = null;
  directionsKnown = true;
  phase = "directions";
  push(8,tr("Khai báo 4 hướng","Define four directions"),tr("Flood fill nối theo cạnh, không nối chéo.","Flood fill uses edges, not diagonals."),{vars:[{name:"directions",value:"down, up, right, left"}]});
  stack=[[startRow,startCol]];
  stackKnown = true;
  currentCell = [startRow,startCol];
  phase = "stack-init";
  push(9,tr(`stack = [(${startRow},${startCol})]`,`stack = [(${startRow},${startCol})]`),tr("Đặt ô bắt đầu vào DFS stack.","Put the start cell on the DFS stack."),{current:[startRow,startCol]});
  image[startRow][startCol]=color; changed[startRow][startCol]=true;
  phase = "fill-start";
  push(10,tr(`image[${startRow}][${startCol}] = ${color}`,`image[${startRow}][${startCol}] = ${color}`),tr("Tô trước khi enqueue để không thêm trùng.","Recolor before traversal to prevent duplicate pushes."),{current:[startRow,startCol],discovered:[startRow,startCol]});
  while(stack.length){
    currentCell = null; neighborCell = null; activeDirection = null; insideGrid = null; matchesOriginal = null; canFillNeighbor = null; phase = "stack-check";
    push(11,tr("while stack → True","while stack → True"),tr("Stack còn ô cần mở rộng.","The stack still has a cell to expand."));
    const [row,col]=stack.pop();
    currentCell = [row,col]; phase = "pop";
    push(12,tr(`pop → (${row},${col})`,`pop → (${row},${col})`),tr("Lấy ô trên cùng của stack.","Pop the top stack cell."),{current:[row,col],vars:[{name:"row",value:row},{name:"col",value:col}]});
    for(const [deltaRow,deltaCol] of directions){
      activeDirection = [deltaRow,deltaCol]; neighborCell = null; insideGrid = null; matchesOriginal = null; canFillNeighbor = null; phase = "direction";
      push(13,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét một neighbor.","Inspect one neighbor."),{current:[row,col],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});
      const nextRow=row+deltaRow,nextCol=col+deltaCol;
      neighborCell = [nextRow,nextCol]; phase = "neighbor";
      push(14,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[row,col],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});
      insideGrid=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols;
      matchesOriginal=insideGrid ? image[nextRow][nextCol]===originalColor : null;
      const canFill=insideGrid&&matchesOriginal;
      canFillNeighbor = canFill; phase = "neighbor-check";
      push(15,tr(`Neighbor có original_color → ${canFill}`,`Neighbor has original_color → ${canFill}`),canFill?tr("Neighbor thuộc component; sẽ tô màu.","The neighbor belongs to the component; recolor it."):tr("Ngoài biên hoặc màu khác/đã tô; bỏ qua.","Out of bounds or different/already filled; skip."),{current:nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols?[nextRow,nextCol]:[row,col],vars:[{name:"can fill?",value:canFill}]});
      if(!canFill) continue;
      image[nextRow][nextCol]=color; changed[nextRow][nextCol]=true;
      phase = "fill-neighbor";
      push(16,tr(`image[${nextRow}][${nextCol}] = ${color}`,`image[${nextRow}][${nextCol}] = ${color}`),tr("Tô neighbor ngay.","Recolor the neighbor immediately."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});
      stack.push([nextRow,nextCol]);
      phase = "push-neighbor";
      push(17,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack để tiếp tục lan.","Push the neighbor for further expansion."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});
    }
  }
  currentCell = null; neighborCell = null; activeDirection = null; insideGrid = null; matchesOriginal = null; canFillNeighbor = null; phase = "stack-empty";
  push(11,tr("while stack → False","while stack → False"),tr("Stack rỗng; component đã tô xong.","The stack is empty; the component is complete."));
  phase = "done";
  push(18,tr("return image","return image"),tr("Trả về image sau flood fill.","Return the flood-filled image."),{final:true,vars:[{name:"answer",value:JSON.stringify(image)}]});
  return {original,answer:image,steps};
}

function buildSteps733Recursive(input, params = {}) {
  const parsed = parseNumbers(input);
  const original = parsed.grid.map((row) => [...row]);
  if (!parsed.valid) {
    const result = invalid(original, tr("Image phải là ma trận chữ nhật gồm số nguyên.", "Image must be a rectangular integer matrix."));
    result.steps.forEach((step) => { step.codeBlock = 2; });
    return result;
  }

  const image = parsed.grid.map((row) => [...row]);
  const rows = image.length;
  const cols = image[0].length;
  const startRow = Number(params.start_row ?? params.sr ?? 1);
  const startCol = Number(params.start_col ?? params.sc ?? 1);
  const color = Number(params.color ?? 2);
  if (!Number.isInteger(startRow) || !Number.isInteger(startCol) || !Number.isInteger(color)
    || startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) {
    const result = invalid(original, tr("sr/sc phải nằm trong image và color phải là số nguyên.", "sr/sc must be inside the image and color must be an integer."));
    result.steps.forEach((step) => { step.codeBlock = 2; });
    return result;
  }

  const originalColor = image[startRow][startCol];
  const changed = Array.from({ length: rows }, () => Array(cols).fill(false));
  const callStack = [];
  const steps = [];
  let phase = "enter";
  let currentCell = null;
  let neighborCell = null;
  let activeDirection = null;
  let insideGrid = null;
  let matchesOriginal = null;
  let canFillNeighbor = null;
  let dimensionsKnown = false;
  let originalKnown = false;
  let directionsKnown = false;
  let stackKnown = false;

  function push(line, title, note, options = {}) {
    const filledCount = changed.reduce((total, row) => total + row.filter(Boolean).length, 0);
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: [line],
      codeBlock: 2,
      vars: [
        ...(options.vars || []),
        { name: "call stack", value: stackText(callStack.map((frame) => [frame.row, frame.col])) },
      ],
      note,
      floodFillView: {
        phase,
        mode: "recursive",
        rows,
        cols,
        image: image.map((row) => [...row]),
        original: original.map((row) => [...row]),
        changed: changed.map((row) => [...row]),
        start: [startRow, startCol],
        current: currentCell ? [...currentCell] : null,
        neighbor: neighborCell ? [...neighborCell] : null,
        direction: activeDirection ? [...activeDirection] : null,
        insideGrid,
        matchesOriginal,
        canFill: canFillNeighbor,
        originalColor: originalKnown ? originalColor : null,
        newColor: color,
        dimensionsKnown,
        directionsKnown,
        stackKnown,
        stack: callStack.map((frame) => [frame.row, frame.col]),
        stackFrames: callStack.map((frame, depth) => ({ ...frame, depth })),
        filledCount,
      },
    });
  }

  push(2, tr("Bắt đầu floodFill đệ quy", "Enter recursive floodFill"), tr("Cách 2 dùng call stack của hàm dfs thay cho stack tự tạo.", "Approach 2 uses dfs call frames instead of an explicit stack."), {
    vars: [{ name: "start", value: `(${startRow},${startCol})` }, { name: "color", value: color }],
  });
  phase = "rows";
  push(3, tr(`rows = ${rows}`, `rows = ${rows}`), tr("Lưu số hàng của image.", "Store the image row count."), { vars: [{ name: "rows", value: rows }] });
  dimensionsKnown = true;
  phase = "dimensions";
  push(4, tr(`cols = ${cols}`, `cols = ${cols}`), tr("Đã biết đầy đủ biên hợp lệ của image.", "The valid image bounds are now known."), { vars: [{ name: "cols", value: cols }] });
  originalKnown = true;
  currentCell = [startRow, startCol];
  phase = "read-color";
  push(6, tr(`original_color = ${originalColor}`, `original_color = ${originalColor}`), tr("DFS chỉ đi qua các ô nối liền còn mang màu gốc này.", "DFS only enters connected cells that still carry this source color."), {
    vars: [{ name: "original_color", value: originalColor }],
  });

  const unchanged = originalColor === color;
  phase = "same-color-check";
  push(8, tr(`original_color == color → ${unchanged}`, `original_color == color → ${unchanged}`), unchanged
    ? tr("Màu mới trùng màu gốc nên phải dừng trước khi gọi dfs.", "The new color matches the source, so stop before calling dfs.")
    : tr("Hai màu khác nhau; tiếp tục định nghĩa dfs.", "The colors differ; continue to define dfs."), {
    vars: [{ name: "same color?", value: unchanged }],
  });
  if (unchanged) {
    phase = "done";
    push(9, tr("return image", "return image"), tr("Image giữ nguyên và không tạo recursive frame nào.", "The image is unchanged and no recursive frame is created."), {
      final: true,
      vars: [{ name: "answer", value: JSON.stringify(image) }],
    });
    return { original, answer: image, steps };
  }

  currentCell = null;
  directionsKnown = true;
  phase = "define-dfs";
  push(11, tr("Định nghĩa dfs(row, col)", "Define dfs(row, col)"), tr("Mỗi lời gọi kiểm tra hai base case, tô ô hợp lệ rồi gọi tiếp bốn hướng.", "Each call checks two base cases, recolors a valid cell, then calls four directions."));

  function dfs(row, col, callerLine, relation) {
    callStack.push({ row, col, callerLine, relation });
    stackKnown = true;
    currentCell = [row, col];
    neighborCell = null;
    insideGrid = null;
    matchesOriginal = null;
    canFillNeighbor = null;
    phase = "dfs-enter";
    push(11, tr(`Vào dfs(${row}, ${col})`, `Enter dfs(${row}, ${col})`), tr(`Tạo frame depth ${callStack.length - 1} trên call stack.`, `Create depth-${callStack.length - 1} frame on the call stack.`), {
      vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "depth", value: callStack.length - 1 }],
    });

    insideGrid = row >= 0 && row < rows && col >= 0 && col < cols;
    phase = "bounds-check";
    push(12, tr(`Ngoài biên → ${!insideGrid}`, `Out of bounds → ${!insideGrid}`), insideGrid
      ? tr(`${coordText(row, col)} nằm trong image; kiểm tra màu tiếp theo.`, `${coordText(row, col)} is inside the image; check its color next.`)
      : tr(`${coordText(row, col)} nằm ngoài image; frame này phải return.`, `${coordText(row, col)} is outside the image; this frame must return.`), {
      vars: [{ name: "in bounds?", value: insideGrid }],
    });
    if (!insideGrid) {
      phase = "return-bounds";
      push(13, tr(`return khỏi dfs(${row}, ${col})`, `Return from dfs(${row}, ${col})`), tr("Base case 1 dừng nhánh trước khi truy cập image[row][col].", "Base case 1 stops this branch before reading image[row][col]."));
      callStack.pop();
      return;
    }

    matchesOriginal = image[row][col] === originalColor;
    canFillNeighbor = matchesOriginal;
    phase = "color-check";
    push(15, tr(`image[${row}][${col}] != original → ${!matchesOriginal}`, `image[${row}][${col}] != original → ${!matchesOriginal}`), matchesOriginal
      ? tr("Ô vẫn mang màu gốc; frame được phép tô.", "The cell still has the source color; this frame may recolor it.")
      : tr("Ô có màu khác hoặc đã được tô; return để không đi lặp.", "The cell has a different color or was already recolored; return to prevent revisiting."), {
      vars: [{ name: `image[${row}][${col}]`, value: image[row][col] }, { name: "matches original?", value: matchesOriginal }],
    });
    if (!matchesOriginal) {
      phase = "return-color";
      push(16, tr(`return khỏi dfs(${row}, ${col})`, `Return from dfs(${row}, ${col})`), tr("Base case 2 kết thúc frame mà không thay đổi image.", "Base case 2 ends this frame without changing the image."));
      callStack.pop();
      return;
    }

    image[row][col] = color;
    changed[row][col] = true;
    phase = "recolor";
    push(18, tr(`image[${row}][${col}] = ${color}`, `image[${row}][${col}] = ${color}`), tr("Tô trước bốn lời gọi con để lần quay lại ô này gặp base case 2.", "Recolor before the four child calls so any revisit hits base case 2."), {
      vars: [{ name: "filled cell", value: coordText(row, col) }],
    });

    const calls = [
      { line: 20, delta: [1, 0], label: tr("xuống", "down") },
      { line: 21, delta: [-1, 0], label: tr("lên", "up") },
      { line: 22, delta: [0, 1], label: tr("phải", "right") },
      { line: 23, delta: [0, -1], label: tr("trái", "left") },
    ];
    for (const call of calls) {
      const nextRow = row + call.delta[0];
      const nextCol = col + call.delta[1];
      currentCell = [row, col];
      neighborCell = [nextRow, nextCol];
      activeDirection = [...call.delta];
      insideGrid = null;
      matchesOriginal = null;
      canFillNeighbor = null;
      phase = "recursive-call";
      push(call.line, tr(`Gọi dfs(${nextRow}, ${nextCol})`, `Call dfs(${nextRow}, ${nextCol})`), tr(`Tạm dừng frame ${coordText(row, col)} và đi ${call.label.vi} sang frame con.`, `Pause frame ${coordText(row, col)} and go ${call.label.en} into a child frame.`), {
        vars: [{ name: "caller", value: coordText(row, col) }, { name: "callee", value: coordText(nextRow, nextCol) }],
      });
      dfs(nextRow, nextCol, call.line, call.label.en);
      currentCell = [row, col];
      neighborCell = [nextRow, nextCol];
      activeDirection = [...call.delta];
      insideGrid = null;
      matchesOriginal = null;
      canFillNeighbor = null;
      phase = "resume-frame";
      push(call.line, tr(`Trở lại dfs(${row}, ${col})`, `Resume dfs(${row}, ${col})`), tr(`Frame con ${coordText(nextRow, nextCol)} đã return; tiếp tục frame cha.`, `Child frame ${coordText(nextRow, nextCol)} returned; continue the parent frame.`), {
        vars: [{ name: "resumed", value: coordText(row, col) }, { name: "depth", value: callStack.length - 1 }],
      });
    }

    currentCell = [row, col];
    neighborCell = null;
    activeDirection = null;
    insideGrid = null;
    matchesOriginal = null;
    canFillNeighbor = null;
    phase = "dfs-complete";
    push(23, tr(`Hoàn tất dfs(${row}, ${col})`, `Complete dfs(${row}, ${col})`), tr("Cả bốn hướng đã return; frame hiện tại rời call stack.", "All four directions returned; the current frame now leaves the call stack."));
    callStack.pop();
  }

  stackKnown = true;
  neighborCell = [startRow, startCol];
  phase = "main-call";
  push(25, tr(`Gọi dfs(${startRow}, ${startCol})`, `Call dfs(${startRow}, ${startCol})`), tr("Bắt đầu chuỗi đệ quy từ ô được chọn.", "Start the recursive chain from the selected cell."));
  dfs(startRow, startCol, 25, "start");
  currentCell = null;
  neighborCell = null;
  activeDirection = null;
  phase = "main-resume";
  push(25, tr("dfs(sr, sc) đã hoàn tất", "dfs(sr, sc) completed"), tr("Mọi recursive frame đã return; call stack trở lại rỗng.", "Every recursive frame returned; the call stack is empty again."));
  phase = "done";
  push(27, tr("return image", "return image"), tr("Trả về image sau khi DFS đệ quy tô xong component.", "Return the image after recursive DFS finishes the component."), {
    final: true,
    vars: [{ name: "answer", value: JSON.stringify(image) }],
  });
  return { original, answer: image, steps };
}

function buildSteps733Bfs(input, params = {}) {
  const parsed = parseNumbers(input);
  const original = parsed.grid.map((row) => [...row]);
  if (!parsed.valid) {
    const result = invalid(original, tr("Image phải là ma trận chữ nhật gồm số nguyên.", "Image must be a rectangular integer matrix."));
    result.steps.forEach((step) => { step.codeBlock = 3; });
    return result;
  }

  const image = parsed.grid.map((row) => [...row]);
  const rows = image.length;
  const cols = image[0].length;
  const startRow = Number(params.start_row ?? params.sr ?? 1);
  const startCol = Number(params.start_col ?? params.sc ?? 1);
  const color = Number(params.color ?? 2);
  if (!Number.isInteger(startRow) || !Number.isInteger(startCol) || !Number.isInteger(color)
    || startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) {
    const result = invalid(original, tr("sr/sc phải nằm trong image và color phải là số nguyên.", "sr/sc must be inside the image and color must be an integer."));
    result.steps.forEach((step) => { step.codeBlock = 3; });
    return result;
  }

  const originalColor = image[startRow][startCol];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const changed = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [];
  const steps = [];
  let phase = "enter";
  let currentCell = null;
  let neighborCell = null;
  let activeDirection = null;
  let nextRowValue = null;
  let nextColValue = null;
  let rowInside = null;
  let colInside = null;
  let insideGrid = null;
  let matchesOriginal = null;
  let canFillNeighbor = null;
  let originalKnown = false;

  function push(line, title, note, options = {}) {
    const filledCount = changed.reduce((total, row) => total + row.filter(Boolean).length, 0);
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: [line],
      codeBlock: 3,
      vars: [
        ...(options.vars || []),
        { name: "queue", value: stackText(queue) },
      ],
      note,
      floodFillView: {
        phase,
        mode: "bfs",
        rows,
        cols,
        image: image.map((row) => [...row]),
        original: original.map((row) => [...row]),
        changed: changed.map((row) => [...row]),
        start: [startRow, startCol],
        current: currentCell ? [...currentCell] : null,
        neighbor: neighborCell ? [...neighborCell] : null,
        direction: activeDirection ? [...activeDirection] : null,
        nextRow: nextRowValue,
        nextCol: nextColValue,
        rowInside,
        colInside,
        insideGrid,
        matchesOriginal,
        canFill: canFillNeighbor,
        originalColor: originalKnown ? originalColor : null,
        newColor: color,
        stack: queue.map((cell) => [...cell]),
        filledCount,
      },
    });
  }

  push(4, tr("Bắt đầu floodFill bằng BFS", "Enter BFS floodFill"), tr("Cách 3 dùng queue: lấy ở FRONT và thêm neighbor mới vào BACK.", "Approach 3 uses a queue: remove from FRONT and add new neighbors at BACK."), {
    vars: [{ name: "start", value: coordText(startRow, startCol) }, { name: "color", value: color }],
  });
  phase = "dimensions";
  push(5, tr(`rows=${rows}, cols=${cols}`, `rows=${rows}, cols=${cols}`), tr("Lưu kích thước để kiểm tra neighbor có nằm trong image hay không.", "Store the dimensions for neighbor bounds checks."), {
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
  });
  originalKnown = true;
  currentCell = [startRow, startCol];
  phase = "read-color";
  push(6, tr(`original_color = ${originalColor}`, `original_color = ${originalColor}`), tr("BFS chỉ thêm các ô nối liền còn mang màu gốc này.", "BFS only enqueues connected cells still carrying this source color."), {
    vars: [{ name: "original_color", value: originalColor }],
  });

  const unchanged = originalColor === color;
  phase = "same-color-check";
  push(8, tr(`original_color == color → ${unchanged}`, `original_color == color → ${unchanged}`), unchanged
    ? tr("Màu mới trùng màu gốc; return trước khi tạo queue.", "The new color matches the source; return before creating the queue.")
    : tr("Màu khác nhau; có thể bắt đầu BFS.", "The colors differ; BFS can begin."), {
    vars: [{ name: "same color?", value: unchanged }],
  });
  if (unchanged) {
    phase = "done";
    push(9, tr("return image", "return image"), tr("Image giữ nguyên và queue chưa được tạo.", "The image is unchanged and no queue is created."), {
      final: true,
      vars: [{ name: "answer", value: JSON.stringify(image) }],
    });
    return { original, answer: image, steps };
  }

  queue.push([startRow, startCol]);
  phase = "queue-init";
  push(11, tr(`queue = deque([${coordText(startRow, startCol)}])`, `queue = deque([${coordText(startRow, startCol)}])`), tr("Ô bắt đầu vừa là FRONT vừa là BACK của queue.", "The start cell is both FRONT and BACK of the queue."));

  image[startRow][startCol] = color;
  changed[startRow][startCol] = true;
  phase = "fill-start";
  push(12, tr(`image[${startRow}][${startCol}] = ${color}`, `image[${startRow}][${startCol}] = ${color}`), tr("Tô ngay khi enqueue để ô này không thể được thêm lần hai.", "Recolor on enqueue so this cell cannot be added twice."));

  phase = "directions";
  push(13, tr("Khai báo 4 hướng", "Define four directions"), tr("BFS lan theo cạnh: xuống, lên, phải, trái.", "BFS spreads through edges: down, up, right, and left."), {
    vars: [{ name: "directions", value: "down, up, right, left" }],
  });

  while (queue.length) {
    currentCell = null;
    neighborCell = null;
    activeDirection = null;
    insideGrid = null;
    matchesOriginal = null;
    canFillNeighbor = null;
    phase = "queue-check";
    push(15, tr("while queue → True", "while queue → True"), tr(`Queue còn ${queue.length} ô; lấy ô ở FRONT tiếp theo.`, `${queue.length} cell(s) remain; remove the next cell from FRONT.`));

    const [row, col] = queue.shift();
    currentCell = [row, col];
    phase = "dequeue";
    push(16, tr(`popleft → ${coordText(row, col)}`, `popleft → ${coordText(row, col)}`), tr("Chỉ FRONT rời queue; các ô phía sau giữ nguyên thứ tự FIFO.", "Only FRONT leaves the queue; cells behind it keep FIFO order."), {
      vars: [{ name: "row", value: row }, { name: "col", value: col }],
    });

    for (const [deltaRow, deltaCol] of directions) {
      activeDirection = [deltaRow, deltaCol];
      neighborCell = null;
      nextRowValue = null;
      nextColValue = null;
      rowInside = null;
      colInside = null;
      insideGrid = null;
      matchesOriginal = null;
      canFillNeighbor = null;
      phase = "direction";
      push(18, tr(`Thử hướng (${deltaRow},${deltaCol})`, `Try direction (${deltaRow},${deltaCol})`), tr("Chọn một trong bốn hướng từ CURRENT.", "Choose one of four directions from CURRENT."), {
        vars: [{ name: "delta_row", value: deltaRow }, { name: "delta_col", value: deltaCol }],
      });

      const nextRow = row + deltaRow;
      nextRowValue = nextRow;
      phase = "next-row";
      push(19, tr(`next_row = ${nextRow}`, `next_row = ${nextRow}`), tr("Tính hàng của neighbor; cột sẽ được tính ở dòng tiếp theo.", "Compute the neighbor row; its column is computed on the next line."), {
        vars: [{ name: "next_row", value: nextRow }],
      });

      const nextCol = col + deltaCol;
      nextColValue = nextCol;
      neighborCell = [nextRow, nextCol];
      phase = "neighbor";
      push(20, tr(`next_col = ${nextCol}`, `next_col = ${nextCol}`), tr(`Ghép next_row và next_col thành neighbor ${coordText(nextRow, nextCol)}.`, `Combine next_row and next_col into neighbor ${coordText(nextRow, nextCol)}.`), {
        vars: [{ name: "next_row", value: nextRow }, { name: "next_col", value: nextCol }],
      });

      rowInside = nextRow >= 0 && nextRow < rows;
      phase = "row-bounds";
      push(22, tr(`row_inside = ${rowInside}`, `row_inside = ${rowInside}`), tr(`Kiểm tra 0 <= ${nextRow} < ${rows}.`, `Check 0 <= ${nextRow} < ${rows}.`), {
        vars: [{ name: "row_inside", value: rowInside }],
      });

      colInside = nextCol >= 0 && nextCol < cols;
      phase = "col-bounds";
      push(23, tr(`col_inside = ${colInside}`, `col_inside = ${colInside}`), tr(`Kiểm tra 0 <= ${nextCol} < ${cols}.`, `Check 0 <= ${nextCol} < ${cols}.`), {
        vars: [{ name: "col_inside", value: colInside }],
      });

      insideGrid = rowInside && colInside;
      phase = "bounds-check";
      push(25, tr(`not row_inside or not col_inside → ${!insideGrid}`, `not row_inside or not col_inside → ${!insideGrid}`), insideGrid
        ? tr("Neighbor nằm trong image; tiếp tục kiểm tra màu.", "The neighbor is inside the image; check its color next.")
        : tr("Neighbor ngoài image; dòng continue bỏ hướng này.", "The neighbor is outside the image; continue skips this direction."), {
        vars: [{ name: "in bounds?", value: insideGrid }],
      });
      if (!insideGrid) {
        phase = "continue-bounds";
        push(26, tr("continue vì ngoài biên", "Continue out of bounds"), tr("Không truy cập image[next_row][next_col]; chuyển sang hướng kế tiếp.", "Do not access image[next_row][next_col]; move to the next direction."));
        continue;
      }

      matchesOriginal = image[nextRow][nextCol] === originalColor;
      canFillNeighbor = matchesOriginal;
      phase = "color-check";
      push(28, tr(`image[${nextRow}][${nextCol}] != original → ${!matchesOriginal}`, `image[${nextRow}][${nextCol}] != original → ${!matchesOriginal}`), matchesOriginal
        ? tr("Neighbor còn màu gốc; được phép tô và enqueue.", "The neighbor still has the source color; recolor and enqueue it.")
        : tr("Neighbor khác màu hoặc đã được tô; bỏ qua để không enqueue trùng.", "The neighbor differs or was already recolored; skip it to avoid duplicate enqueue."), {
        vars: [{ name: `image[${nextRow}][${nextCol}]`, value: image[nextRow][nextCol] }, { name: "matches original?", value: matchesOriginal }],
      });
      if (!matchesOriginal) {
        phase = "continue-color";
        push(29, tr("continue vì màu không khớp", "Continue on color mismatch"), tr("Queue không thay đổi; xét hướng kế tiếp.", "The queue stays unchanged; inspect the next direction."));
        continue;
      }

      image[nextRow][nextCol] = color;
      changed[nextRow][nextCol] = true;
      phase = "fill-neighbor";
      push(31, tr(`image[${nextRow}][${nextCol}] = ${color}`, `image[${nextRow}][${nextCol}] = ${color}`), tr("Đánh dấu neighbor đã thăm trước khi đưa vào queue.", "Mark the neighbor visited before adding it to the queue."), {
        vars: [{ name: "recolored", value: coordText(nextRow, nextCol) }],
      });

      queue.push([nextRow, nextCol]);
      phase = "enqueue-neighbor";
      push(32, tr(`queue.append(${coordText(nextRow, nextCol)})`, `queue.append(${coordText(nextRow, nextCol)})`), tr("Neighbor vào BACK; các ô đã chờ trước nó sẽ được xử lý trước.", "The neighbor enters at BACK; cells already waiting will be processed first."), {
        vars: [{ name: "enqueued", value: coordText(nextRow, nextCol) }],
      });
    }
  }

  currentCell = null;
  neighborCell = null;
  activeDirection = null;
  nextRowValue = null;
  nextColValue = null;
  rowInside = null;
  colInside = null;
  insideGrid = null;
  matchesOriginal = null;
  canFillNeighbor = null;
  phase = "queue-empty";
  push(15, tr("while queue → False", "while queue → False"), tr("Queue rỗng: không còn ô nào trong component cần mở rộng.", "The queue is empty: no cell in the component remains to expand."));
  phase = "done";
  push(34, tr("return image", "return image"), tr("Trả về image sau khi BFS tô xong toàn bộ vùng.", "Return the image after BFS fills the entire region."), {
    final: true,
    vars: [{ name: "answer", value: JSON.stringify(image) }],
  });
  return { original, answer: image, steps };
}

function coordText(row, col) {
  return `(${row},${col})`;
}

function buildSteps200Detailed(input) {
  const parsed=parseBinary(input,true), original=parsed.grid.map((row)=>[...row]);
  if(!parsed.valid) return invalid(original,tr("Grid chỉ được chứa 0 và 1.","Grid may contain only 0 and 1."));
  const grid=parsed.grid.map((row)=>[...row]),rows=grid.length,cols=grid[0].length,directions=[[1,0],[-1,0],[0,1],[0,-1]];
  let stack=[],islands=0; const islandId=Array.from({length:rows},()=>Array(cols).fill(0));
  function cells(current,discovered){const queued=new Set(stack.map(([r,c])=>`${r},${c}`));return grid.map((matrixRow,r)=>matrixRow.map((value,c)=>{let cls=value==="0"?"wall":"empty",label=value;if(islandId[r][c]){cls="visited";label=String(islandId[r][c]);}if(queued.has(`${r},${c}`))cls="queued";if(discovered&&discovered[0]===r&&discovered[1]===c)cls="path";if(current&&current[0]===r&&current[1]===c)cls="current";return{label,cls};}));}
  const {steps,push}=recorder(rows,cols,cells,()=>stack);
  push(4,tr("Bắt đầu numIslands","Enter numIslands"),tr("Mỗi flood fill hoàn chỉnh tương ứng một đảo.","Each completed flood fill represents one island."));
  push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Lưu kích thước grid.","Store grid dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});
  push(6,tr("Khai báo 4 hướng","Define four directions"),tr("Đảo chỉ nối theo cạnh.","Islands connect only by edges."));
  push(7,tr("islands = 0","islands = 0"),tr("Chưa phát hiện đảo nào.","No island has been found yet."),{vars:[{name:"islands",value:islands}]});
  for(let row=0;row<rows;row++){push(8,tr(`Scan row = ${row}`,`Scan row = ${row}`),tr("Quét từng hàng.","Scan each row."),{vars:[{name:"row",value:row}]});for(let col=0;col<cols;col++){push(9,tr(`Scan (${row},${col})`,`Scan (${row},${col})`),tr("Xét ô hiện tại.","Inspect the current cell."),{current:[row,col],vars:[{name:"col",value:col},{name:"grid[row][col]",value:grid[row][col]}]});const land=grid[row][col]==="1";push(10,tr(`grid[${row}][${col}] != '1' → ${!land}`,`grid[${row}][${col}] != '1' → ${!land}`),land?tr("Đây là đất chưa thăm; bắt đầu đảo mới.","This is unvisited land; start a new island."):tr("Nước hoặc đất đã thăm; continue.","Water or visited land; continue."),{current:[row,col],vars:[{name:"unvisited land?",value:land}]});if(!land)continue;islands++;push(11,tr(`islands += 1 → ${islands}`,`islands += 1 → ${islands}`),tr("Tìm thấy điểm bắt đầu của một đảo mới.","Found the start of a new island."),{current:[row,col],vars:[{name:"islands",value:islands}]});stack=[[row,col]];push(12,tr(`stack = [(${row},${col})]`,`stack = [(${row},${col})]`),tr("Khởi tạo DFS stack cho đảo này.","Initialize the DFS stack for this island."),{current:[row,col]});grid[row][col]="0";islandId[row][col]=islands;push(13,tr(`grid[${row}][${col}] = '0'`,`grid[${row}][${col}] = '0'`),tr("Đánh dấu trước khi push để không thăm trùng.","Mark before traversal to avoid duplicate visits."),{current:[row,col],discovered:[row,col]});while(stack.length){push(14,tr("while stack → True","while stack → True"),tr("Stack còn đất của đảo hiện tại.","The stack still contains land from this island."));const[currentRow,currentCol]=stack.pop();push(15,tr(`pop → (${currentRow},${currentCol})`,`pop → (${currentRow},${currentCol})`),tr("Lấy một ô đất để mở rộng.","Pop one land cell to expand."),{current:[currentRow,currentCol],vars:[{name:"current_row",value:currentRow},{name:"current_col",value:currentCol}]});for(const[deltaRow,deltaCol]of directions){push(16,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét neighbor.","Inspect a neighbor."),{current:[currentRow,currentCol],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});const nextRow=currentRow+deltaRow,nextCol=currentCol+deltaCol;push(17,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[currentRow,currentCol],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});const nextLand=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols&&grid[nextRow][nextCol]==="1";push(18,tr(`Neighbor là land → ${nextLand}`,`Neighbor is land → ${nextLand}`),nextLand?tr("Neighbor thuộc cùng đảo.","The neighbor belongs to the same island."):tr("Ngoài biên hoặc không còn là đất; bỏ qua.","Out of bounds or no longer land; skip."),{current:nextLand?[nextRow,nextCol]:[currentRow,currentCol],vars:[{name:"unvisited land?",value:nextLand}]});if(!nextLand)continue;grid[nextRow][nextCol]="0";islandId[nextRow][nextCol]=islands;push(19,tr(`grid[${nextRow}][${nextCol}] = '0'`,`grid[${nextRow}][${nextCol}] = '0'`),tr("Đánh dấu neighbor đã thăm.","Mark the neighbor visited."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});stack.push([nextRow,nextCol]);push(20,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack.","Push the neighbor onto the stack."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});}}push(14,tr("while stack → False","while stack → False"),tr(`Đã flood fill xong đảo #${islands}.`,`Island #${islands} is fully flood-filled.`));}}
  push(21,tr(`return ${islands}`,`return ${islands}`),tr("Trả về tổng số đảo.","Return the total island count."),{final:true,vars:[{name:"answer",value:islands}]});return{original,answer:islands,steps};
}

function buildSteps695Detailed(input) {
  const parsed=parseBinary(input),original=parsed.grid.map((row)=>[...row]);if(!parsed.valid)return invalid(original,tr("Grid chỉ được chứa 0 và 1.","Grid may contain only 0 and 1."));
  const grid=parsed.grid.map((row)=>[...row]),rows=grid.length,cols=grid[0].length,directions=[[1,0],[-1,0],[0,1],[0,-1]];let stack=[],maxArea=0,island=0;const owner=Array.from({length:rows},()=>Array(cols).fill(0)),best=new Set();
  // label = LIVE grid[r][c] so the viewer literally watches 1 → 0 when the code
  // runs `grid[row][col] = 0` / `grid[next_row][next_col] = 0`.
  // meta  = #N tag showing which island absorbed the cell.
  // Base wall/empty class uses the ORIGINAL grid so water stays visually water.
  function cells(current,discovered){const queued=new Set(stack.map(([r,c])=>`${r},${c}`));return grid.map((matrixRow,r)=>matrixRow.map((value,c)=>{let cls=original[r][c]===0?"wall":"empty";const meta=owner[r][c]?`#${owner[r][c]}`:"";if(owner[r][c])cls="visited";if(best.has(`${r},${c}`))cls="path";if(queued.has(`${r},${c}`))cls="queued";if(discovered&&discovered[0]===r&&discovered[1]===c)cls="path";if(current&&current[0]===r&&current[1]===c)cls="current";return{label:String(value),meta,cls};}));}
  const{steps,push}=recorder(rows,cols,cells,()=>stack);push(4,tr("Bắt đầu maxAreaOfIsland","Enter maxAreaOfIsland"),tr("Flood fill từng đảo và giữ area lớn nhất.","Flood-fill each island and keep the largest area."));push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Lưu kích thước grid.","Store grid dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});push(6,tr("Khai báo 4 hướng","Define four directions"),tr("Đảo nối theo cạnh.","Islands connect by edges."));push(7,tr("max_area = 0","max_area = 0"),tr(`Khởi tạo diện tích lớn nhất.\nSố lớn trong mỗi ô là GIÁ TRỊ THẬT của grid[r][c] — bạn sẽ thấy nó đổi 1 → 0 ngay khi code chạy line 12 hoặc line 20. Nhãn nhỏ #N cho biết ô đó thuộc đảo số mấy.\ngrid: ${grid.map((gr)=>gr.join("")).join(" | ")}`,`Initialize the largest area.\nThe big number in each cell is the LIVE value of grid[r][c] — watch it flip 1 → 0 the moment line 12 or line 20 runs. The small #N tag shows which island the cell belongs to.\ngrid: ${grid.map((gr)=>gr.join("")).join(" | ")}`),{vars:[{name:"max_area",value:0},{name:"grid (live)",value:grid.map((gr)=>gr.join("")).join(" | ")}]});
  for(let row=0;row<rows;row++){push(8,tr(`Scan row = ${row}`,`Scan row = ${row}`),tr("Quét hàng.","Scan a row."),{vars:[{name:"row",value:row}]});for(let col=0;col<cols;col++){push(9,tr(`Scan (${row},${col})`,`Scan (${row},${col})`),tr("Xét ô hiện tại.","Inspect the current cell."),{current:[row,col],vars:[{name:"col",value:col},{name:"grid[row][col]",value:grid[row][col]}]});const land=grid[row][col]===1;push(10,tr(`grid[${row}][${col}] != 1 → ${!land}`,`grid[${row}][${col}] != 1 → ${!land}`),land?tr("Bắt đầu đo một đảo mới.","Start measuring a new island."):tr("Không phải đất chưa thăm; continue.","Not unvisited land; continue."),{current:[row,col],vars:[{name:"unvisited land?",value:land}]});if(!land)continue;island++;stack=[[row,col]];push(11,tr(`stack = [(${row},${col})]`,`stack = [(${row},${col})]`),tr("Khởi tạo stack cho đảo.","Initialize the island stack."),{current:[row,col]});const gb1=grid.map((gr)=>gr.join("")).join(" | ");grid[row][col]=0;owner[row][col]=island;const ga1=grid.map((gr)=>gr.join("")).join(" | ");push(12,tr(`grid[${row}][${col}] = 0  ⟵ 1 bị ghi thành 0`,`grid[${row}][${col}] = 0  ⟵ 1 overwritten to 0`),tr(`Ô hạt giống của đảo #${island} vừa đổi 1 → 0 ngay trên lưới. Không cần mảng visited riêng: lần sau line 19 thấy 0 sẽ tự bỏ qua.\ngrid: ${gb1}  →  ${ga1}`,`The seed cell of island #${island} just flipped 1 → 0 in the grid. No separate visited array needed: next time line 19 sees 0 and skips it.\ngrid: ${gb1}  →  ${ga1}`),{current:[row,col],discovered:[row,col],vars:[{name:"grid[row][col] trước",value:1},{name:"grid[row][col] sau",value:0},{name:"grid trước",value:gb1},{name:"grid sau",value:ga1},{name:"island #",value:island}]});let area=0,currentCells=[];push(13,tr("area = 0","area = 0"),tr("Bắt đầu đếm diện tích đảo.","Begin counting island area."),{vars:[{name:"area",value:area}]});while(stack.length){push(14,tr("while stack → True","while stack → True"),tr("Stack còn đất cần đếm.","The stack still has land to count."));const[currentRow,currentCol]=stack.pop();push(15,tr(`pop → (${currentRow},${currentCol})`,`pop → (${currentRow},${currentCol})`),tr("Lấy một ô đất khỏi stack.","Pop one land cell."),{current:[currentRow,currentCol],vars:[{name:"current_row",value:currentRow},{name:"current_col",value:currentCol}]});area++;currentCells.push(`${currentRow},${currentCol}`);push(16,tr(`area += 1 → ${area}`,`area += 1 → ${area}`),tr("Mỗi ô pop ra đóng góp một đơn vị diện tích.","Each popped cell contributes one area unit."),{current:[currentRow,currentCol],vars:[{name:"area",value:area}]});for(const[deltaRow,deltaCol]of directions){push(17,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét neighbor.","Inspect a neighbor."),{current:[currentRow,currentCol],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});const nextRow=currentRow+deltaRow,nextCol=currentCol+deltaCol;push(18,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[currentRow,currentCol],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});const inBounds=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols;const nextLand=inBounds&&grid[nextRow][nextCol]===1;const whyVi=!inBounds?"ngoài lưới":grid[nextRow][nextCol]===1?"đất chưa thăm":owner[nextRow][nextCol]?`đã thăm — bị ghi 0 bởi đảo #${owner[nextRow][nextCol]}`:"nước ngay từ đầu";const whyEn=!inBounds?"out of bounds":grid[nextRow][nextCol]===1?"unvisited land":owner[nextRow][nextCol]?`already visited — set to 0 by island #${owner[nextRow][nextCol]}`:"water from the start";push(19,tr(`Neighbor là land → ${nextLand}`,`Neighbor is land → ${nextLand}`),nextLand?tr("Neighbor thuộc đảo hiện tại.","The neighbor belongs to this island."):tr(`Bỏ qua neighbor: ${whyVi}.`,`Skip the neighbor: ${whyEn}.`),{current:nextLand?[nextRow,nextCol]:[currentRow,currentCol],vars:[{name:"in bounds?",value:inBounds},{name:"grid[next] (live)",value:inBounds?grid[nextRow][nextCol]:"—"},{name:"lý do / reason",value:whyVi},{name:"unvisited land?",value:nextLand}]});if(!nextLand)continue;const gb2=grid.map((gr)=>gr.join("")).join(" | ");grid[nextRow][nextCol]=0;owner[nextRow][nextCol]=island;const ga2=grid.map((gr)=>gr.join("")).join(" | ");push(20,tr(`grid[${nextRow}][${nextCol}] = 0  ⟵ 1 bị ghi thành 0`,`grid[${nextRow}][${nextCol}] = 0  ⟵ 1 overwritten to 0`),tr(`Ghi 0 NGAY LÚC PHÁT HIỆN (trước khi push vào stack) — nhờ vậy không ô nào bị đưa vào stack hai lần.\ngrid: ${gb2}  →  ${ga2}`,`Write 0 AT DISCOVERY TIME (before pushing onto the stack) — that is what stops any cell from entering the stack twice.\ngrid: ${gb2}  →  ${ga2}`),{current:[nextRow,nextCol],discovered:[nextRow,nextCol],vars:[{name:"grid[next] trước",value:1},{name:"grid[next] sau",value:0},{name:"grid trước",value:gb2},{name:"grid sau",value:ga2}]});stack.push([nextRow,nextCol]);push(21,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack.","Push the neighbor."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});}}push(14,tr("while stack → False","while stack → False"),tr(`Đảo có area = ${area}.`,`The island area is ${area}.`));if(area>maxArea){maxArea=area;best.clear();for(const cell of currentCells)best.add(cell);}push(22,tr(`max_area = max(max_area, ${area}) → ${maxArea}`,`max_area = max(max_area, ${area}) → ${maxArea}`),tr("Cập nhật diện tích lớn nhất sau đảo này.","Update the largest area after this island."),{vars:[{name:"area",value:area},{name:"max_area",value:maxArea}]});}}
  push(23,tr(`return ${maxArea}`,`return ${maxArea}`),tr("Trả về diện tích đảo lớn nhất.","Return the largest island area."),{final:true,vars:[{name:"answer",value:maxArea}]});return{original,answer:maxArea,steps};
}

function parseGridPair(input){const parts=String(input).split(";");if(parts.length!==2)return{valid:false,grid1:[],grid2:[]};const a=parseBinary(parts[0]),b=parseBinary(parts[1]);return{valid:a.valid&&b.valid&&a.grid.length===b.grid.length&&a.grid[0]?.length===b.grid[0]?.length,grid1:a.grid,grid2:b.grid};}

function buildSteps1905(input){
  const parsed=parseGridPair(input),original={grid1:parsed.grid1?.map((r)=>[...r])||[],grid2:parsed.grid2?.map((r)=>[...r])||[]};if(!parsed.valid)return invalid(original,tr("Nhập grid1;grid2, mỗi grid dùng '|' ngăn hàng và chỉ gồm 0/1.","Enter grid1;grid2, using '|' between rows; both grids must contain only 0/1."));
  const grid1=parsed.grid1.map((r)=>[...r]),grid2=parsed.grid2.map((r)=>[...r]),rows=grid1.length,cols=grid1[0].length,directions=[[1,0],[-1,0],[0,1],[0,-1]];let stack=[],count=0,island=0;const owner=Array.from({length:rows},()=>Array(cols).fill(0));
  function cells(current,discovered){const queued=new Set(stack.map(([r,c])=>`${r},${c}`));return grid2.map((row,r)=>row.map((value,c)=>{let label=value===1?(grid1[r][c]===1?"✓":"✕"):owner[r][c]?(grid1[r][c]===1?"✓":"✕"):"",cls=value===1?"empty":"wall";if(owner[r][c])cls=grid1[r][c]===1?"visited":"current";if(queued.has(`${r},${c}`))cls="queued";if(discovered&&discovered[0]===r&&discovered[1]===c)cls="path";if(current&&current[0]===r&&current[1]===c)cls="current";return{label,cls};}));}
  const{steps,push}=recorder(rows,cols,cells,()=>stack);push(4,tr("Bắt đầu countSubIslands","Enter countSubIslands"),tr("Flood fill từng đảo grid2 và kiểm tra mọi ô có nằm trên đất grid1 không.","Flood-fill each grid2 island and verify every cell lies on grid1 land."));push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Hai grid có cùng kích thước.","Both grids have the same dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});push(6,tr("Khai báo 4 hướng","Define four directions"),tr("Đảo nối theo cạnh.","Islands connect by edges."));push(7,tr("count = 0","count = 0"),tr("Chưa xác nhận sub-island nào.","No sub-island has been confirmed."),{vars:[{name:"count",value:count}]});
  for(let row=0;row<rows;row++){push(8,tr(`Scan row = ${row}`,`Scan row = ${row}`),tr("Quét grid2.","Scan grid2."),{vars:[{name:"row",value:row}]});for(let col=0;col<cols;col++){push(9,tr(`Scan (${row},${col})`,`Scan (${row},${col})`),tr("Tìm đất grid2 chưa thăm.","Find unvisited grid2 land."),{current:[row,col],vars:[{name:"col",value:col},{name:"grid2[row][col]",value:grid2[row][col]}]});const land=grid2[row][col]===1;push(10,tr(`grid2[${row}][${col}] != 1 → ${!land}`,`grid2[${row}][${col}] != 1 → ${!land}`),land?tr("Bắt đầu kiểm tra một đảo grid2.","Start checking a grid2 island."):tr("Không phải đất chưa thăm; continue.","Not unvisited land; continue."),{current:[row,col],vars:[{name:"unvisited land?",value:land}]});if(!land)continue;island++;stack=[[row,col]];push(11,tr(`stack = [(${row},${col})]`,`stack = [(${row},${col})]`),tr("Khởi tạo stack cho đảo grid2.","Initialize the stack for this grid2 island."),{current:[row,col]});grid2[row][col]=0;owner[row][col]=island;push(12,tr(`grid2[${row}][${col}] = 0`,`grid2[${row}][${col}] = 0`),tr("Đánh dấu ô bắt đầu đã thăm.","Mark the start cell visited."),{current:[row,col],discovered:[row,col]});let isSub=true;push(13,tr("is_sub = True","is_sub = True"),tr("Giả sử là sub-island cho tới khi gặp ô không thuộc grid1.","Assume it is a sub-island until a cell misses grid1 land."),{vars:[{name:"is_sub",value:isSub}]});while(stack.length){push(14,tr("while stack → True","while stack → True"),tr("Kiểm tra toàn bộ đảo grid2.","Inspect the entire grid2 island."));const[currentRow,currentCol]=stack.pop();push(15,tr(`pop → (${currentRow},${currentCol})`,`pop → (${currentRow},${currentCol})`),tr("Lấy một ô của đảo.","Pop one island cell."),{current:[currentRow,currentCol],vars:[{name:"current_row",value:currentRow},{name:"current_col",value:currentCol}]});if(grid1[currentRow][currentCol]===0)isSub=false;push(16,tr(`grid1[${currentRow}][${currentCol}] == 0 → ${grid1[currentRow][currentCol]===0}`,`grid1[${currentRow}][${currentCol}] == 0 → ${grid1[currentRow][currentCol]===0}`),grid1[currentRow][currentCol]===0?tr("Ô grid2 không nằm trên đất grid1; đảo này không phải sub-island.","This grid2 cell is not over grid1 land; the island is not a sub-island."):tr("Ô này hợp lệ trong grid1.","This cell is valid in grid1."),{current:[currentRow,currentCol],vars:[{name:"is_sub",value:isSub}]});for(const[deltaRow,deltaCol]of directions){push(17,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét neighbor grid2.","Inspect a grid2 neighbor."),{current:[currentRow,currentCol],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});const nextRow=currentRow+deltaRow,nextCol=currentCol+deltaCol;push(18,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[currentRow,currentCol],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});const nextLand=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols&&grid2[nextRow][nextCol]===1;push(19,tr(`Neighbor grid2 là land → ${nextLand}`,`grid2 neighbor is land → ${nextLand}`),nextLand?tr("Neighbor thuộc cùng đảo grid2.","The neighbor belongs to the same grid2 island."):tr("Bỏ qua neighbor.","Skip the neighbor."),{current:nextLand?[nextRow,nextCol]:[currentRow,currentCol],vars:[{name:"unvisited land?",value:nextLand}]});if(!nextLand)continue;grid2[nextRow][nextCol]=0;owner[nextRow][nextCol]=island;push(20,tr(`grid2[${nextRow}][${nextCol}] = 0`,`grid2[${nextRow}][${nextCol}] = 0`),tr("Đánh dấu neighbor đã thăm.","Mark the neighbor visited."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});stack.push([nextRow,nextCol]);push(21,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack.","Push the neighbor."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});}}push(14,tr("while stack → False","while stack → False"),tr(`Đã kiểm tra xong đảo; is_sub = ${isSub}.`,`Island check complete; is_sub = ${isSub}.`),{vars:[{name:"is_sub",value:isSub}]});push(22,tr(`if is_sub → ${isSub}`,`if is_sub → ${isSub}`),isSub?tr("Toàn bộ đảo grid2 nằm trong grid1.","The whole grid2 island lies inside grid1."):tr("Đảo có ít nhất một ô ngoài đất grid1.","At least one island cell misses grid1 land."),{vars:[{name:"is_sub",value:isSub}]});if(isSub){count++;push(23,tr(`count += 1 → ${count}`,`count += 1 → ${count}`),tr("Xác nhận thêm một sub-island.","Confirm one more sub-island."),{vars:[{name:"count",value:count}]});}}}
  push(24,tr(`return ${count}`,`return ${count}`),tr("Trả về tổng số sub-islands.","Return the total sub-island count."),{final:true,vars:[{name:"answer",value:count}]});return{original,answer:count,steps};
}

// ─── 463: Island Perimeter — detailed line-by-line debugger ──────────────────
// code lines (1-indexed):
//  1  class Solution:
//  2      def islandPerimeter(self, grid):
//  3          rows, cols = len(grid), len(grid[0])
//  4          perimeter = 0
//  5          for r in range(rows):
//  6              for c in range(cols):
//  7                  if grid[r][c] != 1:
//  8                      continue
//  9                  for delta_r, delta_c in [(1,0),(-1,0),(0,1),(0,-1)]:
// 10                      next_r, next_c = r+delta_r, c+delta_c
// 11                      out_of_bounds = next_r<0 or next_r>=rows or next_c<0 or next_c>=cols
// 12                      if out_of_bounds or grid[next_r][next_c] == 0:
// 13                          perimeter += 1
// 14          return perimeter
function buildSteps463(input) {
  const parsed = parseBinary(input, true);
  const original = parsed.grid.map((row) => [...row]);
  if (!parsed.valid) {
    return invalid(original, tr("Grid chỉ được chứa 0 và 1.", "Grid may contain only 0 and 1."));
  }
  const grid = parsed.grid.map((row) => row.map(Number));
  const rows = grid.length;
  const cols = grid[0].length;
  const steps = [];

  // Track which of the 4 edges of each land cell are "perimeter" edges
  // (edge[r][c] = { top, bottom, left, right } booleans), so we can draw them.
  const edges = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ top: false, bottom: false, left: false, right: false })));
  const scanned = Array.from({ length: rows }, () => Array(cols).fill(false));
  const key = (r, c) => `${r},${c}`;

  function makeCells(cur, neighbor) {
    return grid.map((row, r) => row.map((v, c) => {
      let cls = v === 0 ? "wall" : "empty";
      if (v === 1 && scanned[r][c]) cls = "visited";
      if (neighbor && neighbor[0] === r && neighbor[1] === c) cls = "queued";
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      const e = edges[r][c];
      const edgeCount = (e.top ? 1 : 0) + (e.bottom ? 1 : 0) + (e.left ? 1 : 0) + (e.right ? 1 : 0);
      const meta = v === 1 ? `⊥${edgeCount}` : "";
      return { label: String(v), meta, cls };
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title, arr: [],
      bfsGrid: { rows, cols, cells: makeCells(o.cur || null, o.neighbor || null) },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [...(o.vars || []), { name: "perimeter", value: o.perimeter !== undefined ? o.perimeter : "—" }],
      note: o.note,
    });
  }

  // ── Line 3 ──────────────────────────────────────────────────────────
  snap({
    title: { vi: "rows, cols = len(grid), len(grid[0])", en: "rows, cols = len(grid), len(grid[0])" },
    codeLines: [3],
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi: `Lưới ${rows}×${cols}. ⊥N trên mỗi ô đất = số cạnh CHU VI đã tính cho ô đó (0..4).`,
      en: `Grid ${rows}×${cols}. ⊥N on each land cell = number of PERIMETER edges counted so far (0..4).`,
    },
  });

  // ── Line 4 ──────────────────────────────────────────────────────────
  let perimeter = 0;
  snap({
    title: { vi: "perimeter = 0", en: "perimeter = 0" },
    codeLines: [4],
    perimeter,
    vars: [],
    note: {
      vi: "Mỗi ô đất góp 1 cạnh chu vi cho MỖI hướng (trên/dưới/trái/phải) là nước hoặc ngoài lưới.",
      en: "Each land cell contributes 1 perimeter edge for EVERY side (up/down/left/right) that is water or out of bounds.",
    },
  });

  const DIRS = [
    { dr: 1, dc: 0, side: "bottom", label: "(1,0) ↓" },
    { dr: -1, dc: 0, side: "top", label: "(-1,0) ↑" },
    { dr: 0, dc: 1, side: "right", label: "(0,1) →" },
    { dr: 0, dc: -1, side: "left", label: "(0,-1) ←" },
  ];

  for (let r = 0; r < rows; r++) {
    // ── Line 5 ─────────────────────────────────────────────────────────
    snap({
      title: { vi: `line 5: for r in range(rows) → r = ${r}`, en: `line 5: for r in range(rows) → r = ${r}` },
      codeLines: [5], perimeter,
      vars: [{ name: "r", value: r }],
      note: { vi: `Quét dòng ${r}.`, en: `Scan row ${r}.` },
    });

    for (let c = 0; c < cols; c++) {
      // ── Line 6 ───────────────────────────────────────────────────────
      snap({
        title: { vi: `line 6: for c in range(cols) → c = ${c}`, en: `line 6: for c in range(cols) → c = ${c}` },
        cur: [r, c], codeLines: [6], perimeter,
        vars: [{ name: "r, c", value: `${r}, ${c}` }],
        note: { vi: `Xét ô (${r},${c}).`, en: `Inspect cell (${r},${c}).` },
      });

      // ── Line 7 ───────────────────────────────────────────────────────
      const isLand = grid[r][c] === 1;
      snap({
        title: { vi: `line 7: grid[${r}][${c}] != 1?`, en: `line 7: grid[${r}][${c}] != 1?` },
        cur: [r, c], codeLines: [7], perimeter,
        vars: [{ name: "grid[r][c]", value: grid[r][c] }, { name: "is water?", value: !isLand }],
        note: {
          vi: isLand ? `grid[${r}][${c}] = 1 → là đất → sang line 9.` : `grid[${r}][${c}] = 0 → là nước → line 8 continue, bỏ ô này.`,
          en: isLand ? `grid[${r}][${c}] = 1 → land → go to line 9.` : `grid[${r}][${c}] = 0 → water → line 8 continue, skip this cell.`,
        },
      });
      if (!isLand) {
        // ── Line 8 ────────────────────────────────────────────────────
        snap({
          title: { vi: "line 8: continue (là nước)", en: "line 8: continue (is water)" },
          cur: [r, c], codeLines: [8], perimeter,
          vars: [],
          note: { vi: "Nước không có cạnh chu vi → bỏ qua ô này.", en: "Water contributes no perimeter → skip this cell." },
        });
        continue;
      }
      scanned[r][c] = true;

      for (const { dr, dc, side, label } of DIRS) {
        const nr = r + dr;
        const nc = c + dc;

        // ── Line 9 ──────────────────────────────────────────────────
        snap({
          title: { vi: `line 9: thử hướng ${label}`, en: `line 9: try direction ${label}` },
          cur: [r, c], codeLines: [9], perimeter,
          vars: [{ name: "delta_r, delta_c", value: `${dr}, ${dc}` }],
          note: { vi: `Xét cạnh ${side} của ô (${r},${c}).`, en: `Check the ${side} side of cell (${r},${c}).` },
        });

        // ── Line 10 ─────────────────────────────────────────────────
        snap({
          title: { vi: `line 10: next_r, next_c = (${nr}, ${nc})`, en: `line 10: next_r, next_c = (${nr}, ${nc})` },
          cur: [r, c], neighbor: [nr, nc], codeLines: [10], perimeter,
          vars: [{ name: "next_r, next_c", value: `${nr}, ${nc}` }],
          note: { vi: `Tọa độ hàng xóm theo hướng ${side}: (${nr},${nc}).`, en: `Neighbor coordinate towards ${side}: (${nr},${nc}).` },
        });

        // ── Line 11 ─────────────────────────────────────────────────
        const oob = nr < 0 || nr >= rows || nc < 0 || nc >= cols;
        snap({
          title: { vi: `line 11: out_of_bounds = ${oob}`, en: `line 11: out_of_bounds = ${oob}` },
          cur: [r, c], neighbor: oob ? null : [nr, nc], codeLines: [11], perimeter,
          vars: [{ name: "out_of_bounds", value: oob }],
          note: {
            vi: oob ? `(${nr},${nc}) nằm NGOÀI lưới ${rows}×${cols}.` : `(${nr},${nc}) nằm trong lưới.`,
            en: oob ? `(${nr},${nc}) is OUTSIDE the ${rows}×${cols} grid.` : `(${nr},${nc}) is inside the grid.`,
          },
        });

        // ── Line 12 ─────────────────────────────────────────────────
        const neighborWater = !oob && grid[nr][nc] === 0;
        const isPerimeterEdge = oob || neighborWater;
        snap({
          title: {
            vi: `line 12: out_of_bounds or grid[next]==0 → ${isPerimeterEdge}`,
            en: `line 12: out_of_bounds or grid[next]==0 → ${isPerimeterEdge}`,
          },
          cur: [r, c], neighbor: oob ? null : [nr, nc], codeLines: [12], perimeter,
          vars: [
            { name: "out_of_bounds", value: oob },
            { name: "grid[next_r][next_c]", value: oob ? "—" : grid[nr][nc] },
            { name: "is perimeter edge?", value: isPerimeterEdge },
          ],
          note: {
            vi: isPerimeterEdge
              ? (oob ? `Ngoài lưới → cạnh ${side} là biên chu vi → line 13 cộng 1.` : `grid[${nr}][${nc}]=0 (nước) → cạnh ${side} là biên chu vi → line 13 cộng 1.`)
              : `grid[${nr}][${nc}]=1 (đất liền kề) → cạnh ${side} KHÔNG phải biên chu vi, hai ô đất dính nhau che cạnh này.`,
            en: isPerimeterEdge
              ? (oob ? `Out of bounds → the ${side} side is a perimeter edge → line 13 adds 1.` : `grid[${nr}][${nc}]=0 (water) → the ${side} side is a perimeter edge → line 13 adds 1.`)
              : `grid[${nr}][${nc}]=1 (adjacent land) → the ${side} side is NOT a perimeter edge, the two land cells cover it.`,
          },
        });

        if (isPerimeterEdge) {
          // ── Line 13 ───────────────────────────────────────────────
          perimeter += 1;
          edges[r][c][side] = true;
          snap({
            title: { vi: `line 13: perimeter += 1 → ${perimeter}`, en: `line 13: perimeter += 1 → ${perimeter}` },
            cur: [r, c], codeLines: [13], perimeter,
            vars: [{ name: "side counted", value: side }, { name: "perimeter", value: perimeter }],
            note: {
              vi: `Cộng 1 cạnh chu vi cho phía ${side} của (${r},${c}). perimeter = ${perimeter}.`,
              en: `Add 1 perimeter edge for the ${side} side of (${r},${c}). perimeter = ${perimeter}.`,
            },
          });
        }
      }
    }
  }

  // ── Line 14 ─────────────────────────────────────────────────────────
  snap({
    title: { vi: `line 14: return ${perimeter}`, en: `line 14: return ${perimeter}` },
    final: true, codeLines: [14], perimeter,
    vars: [{ name: "answer", value: perimeter }],
    note: {
      vi: `Đã quét hết lưới. Tổng chu vi đảo = ${perimeter}. Mỗi ⊥N trên ô đất cho biết ô đó góp bao nhiêu cạnh vào chu vi.`,
      en: `Finished scanning. Total island perimeter = ${perimeter}. Each ⊥N on a land cell shows how many edges it contributed.`,
    },
  });

  return { original: grid, answer: perimeter, steps };
}

// ─── 463 Approach 2: "+4 then subtract shared edges" — line-by-line ──────────
// code2 lines (1-indexed):
//  1  class Solution:
//  2      def islandPerimeter(self, grid):
//  3          n_rows = len(grid)
//  4          n_cols = len(grid[0])
//  5          total = 0
//  6          for i in range(n_rows):
//  7              for j in range(n_cols):
//  8                  if grid[i][j] == 1:
//  9                      total += 4
// 10                      if j > 0 and grid[i][j-1] == 1:
// 11                          total -= 2
// 12                      if i > 0 and grid[i-1][j] == 1:
// 13                          total -= 2
// 14          return total
function buildSteps463v2(input) {
  const parsed = parseBinary(input, true);
  const original = parsed.grid.map((row) => [...row]);
  if (!parsed.valid) {
    return invalid(original, tr("Grid chỉ được chứa 0 và 1.", "Grid may contain only 0 and 1."));
  }
  const grid = parsed.grid.map((row) => row.map(Number));
  const rows = grid.length;
  const cols = grid[0].length;
  const steps = [];

  // contrib[r][c] = running perimeter contribution counted so far for that cell (starts at 0, up to 4).
  const contrib = Array.from({ length: rows }, () => Array(cols).fill(0));
  const scanned = Array.from({ length: rows }, () => Array(cols).fill(false));

  // meta on a land cell = Σ<net edges so far>. The neighbor currently being
  // read (grid[i][j-1] on line 10, grid[i-1][j] on line 12) is tagged with a
  // small arrow so it's unmistakable which cell the code is comparing against.
  function makeCells(cur, peer, peerLabel) {
    return grid.map((row, r) => row.map((v, c) => {
      let cls = v === 0 ? "wall" : "empty";
      if (v === 1 && scanned[r][c]) cls = "visited";
      let meta = v === 1 ? `Σ${contrib[r][c]}` : "";
      if (peer && peer[0] === r && peer[1] === c) {
        cls = "neighbor";
        meta = peerLabel ? `${peerLabel} ${meta}`.trim() : meta;
      }
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      return { label: String(v), meta, cls };
    }));
  }

  // Track current loop indices so every step (even before i/j exist yet)
  // can show them consistently in the debug watch panel.
  let curI = null;
  let curJ = null;

  function snap(o) {
    steps.push({
      title: o.title, arr: [], codeBlock: 2,
      bfsGrid: { rows, cols, cells: makeCells(o.cur || null, o.peer || null, o.peerLabel || null) },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [
        { name: "i", value: curI === null ? "—" : curI },
        { name: "j", value: curJ === null ? "—" : curJ },
        ...(o.vars || []),
        { name: "total", value: o.total !== undefined ? o.total : "—" },
      ],
      note: o.note,
    });
  }

  // ── Lines 3–4 ───────────────────────────────────────────────────────
  snap({
    title: { vi: "n_rows = len(grid); n_cols = len(grid[0])", en: "n_rows = len(grid); n_cols = len(grid[0])" },
    codeLines: [3, 4],
    vars: [{ name: "n_rows", value: rows }, { name: "n_cols", value: cols }],
    note: {
      vi: `Lưới ${rows}×${cols}. Ý tưởng khác: mỗi ô đất coi như CÓ SẴN 4 cạnh, rồi TRỪ ĐI 2 cho mỗi cặp đất kề TRÁI hoặc TRÊN (mỗi cặp đất dính chỉ trừ đúng 1 lần, không đếm 2 lần).`,
      en: `Grid ${rows}×${cols}. Different idea: assume every land cell starts with 4 free edges, then SUBTRACT 2 for every LEFT or TOP land neighbor (each touching pair is subtracted exactly once, never twice).`,
    },
  });

  // ── Line 5 ──────────────────────────────────────────────────────────
  let total = 0;
  snap({
    title: { vi: "total = 0", en: "total = 0" },
    codeLines: [5], total,
    vars: [],
    note: {
      vi: "Σ trên mỗi ô đất là tổng đóng góp NET của ô đó vào total (4 trừ đi các lần bị trừ 2).",
      en: "Σ on each land cell is that cell's NET contribution to total (4 minus every −2 deduction).",
    },
  });

  for (let i = 0; i < rows; i++) {
    // ── Line 6 ──────────────────────────────────────────────────────
    curI = i;
    curJ = null; // j does not exist yet at line 6, matches Python semantics
    snap({
      title: { vi: `line 6: for i in range(n_rows) → i = ${i}`, en: `line 6: for i in range(n_rows) → i = ${i}` },
      codeLines: [6], total,
      vars: [],
      note: { vi: `Quét dòng ${i}.`, en: `Scan row ${i}.` },
    });

    for (let j = 0; j < cols; j++) {
      curJ = j;
      // ── Line 7 ────────────────────────────────────────────────────
      snap({
        title: { vi: `line 7: for j in range(n_cols) → j = ${j}`, en: `line 7: for j in range(n_cols) → j = ${j}` },
        cur: [i, j], codeLines: [7], total,
        vars: [],
        note: { vi: `Xét ô (${i},${j}).`, en: `Inspect cell (${i},${j}).` },
      });

      // ── Line 8 ────────────────────────────────────────────────────
      const isLand = grid[i][j] === 1;
      snap({
        title: { vi: `line 8: grid[${i}][${j}] == 1?`, en: `line 8: grid[${i}][${j}] == 1?` },
        cur: [i, j], codeLines: [8], total,
        vars: [{ name: "grid[i][j]", value: grid[i][j] }, { name: "is land?", value: isLand }],
        note: {
          vi: isLand ? `grid[${i}][${j}] = 1 → là đất → sang line 9.` : `grid[${i}][${j}] = 0 → là nước → bỏ qua ô này, sang j tiếp theo.`,
          en: isLand ? `grid[${i}][${j}] = 1 → land → go to line 9.` : `grid[${i}][${j}] = 0 → water → skip this cell, move to the next j.`,
        },
      });
      if (!isLand) continue;
      scanned[i][j] = true;

      // ── Line 9: total += 4 ───────────────────────────────────────
      total += 4;
      contrib[i][j] += 4;
      snap({
        title: { vi: `line 9: total += 4 → ${total}`, en: `line 9: total += 4 → ${total}` },
        cur: [i, j], codeLines: [9], total,
        vars: [{ name: "cell contribution", value: contrib[i][j] }, { name: "total", value: total }],
        note: {
          vi: `Giả sử (${i},${j}) là đảo cô lập → có 4 cạnh tự do. total = ${total}. Bây giờ kiểm tra 2 hàng xóm ĐÃ QUÉT (trái, trên) để trừ cạnh dính.`,
          en: `Assume (${i},${j}) is an isolated island → 4 free edges. total = ${total}. Now check its 2 ALREADY-SCANNED neighbors (left, top) to subtract shared edges.`,
        },
      });

      // ── Line 10: check left neighbor ──────────────────────────────
      // Python's `and` short-circuits: when j==0, grid[i][j-1] is NEVER
      // evaluated (no negative-index lookup happens). Reflect that exactly.
      const hasLeft = j > 0;
      const leftLand = hasLeft && grid[i][j - 1] === 1;
      const leftExprTitle = hasLeft
        ? `j > 0 and grid[${i}][${j - 1}] == 1 → ${leftLand}`
        : `j > 0 → False (dừng ở đây, không đọc grid[${i}][-1])`;
      const leftExprTitleEn = hasLeft
        ? `j > 0 and grid[${i}][${j - 1}] == 1 → ${leftLand}`
        : `j > 0 → False (stops here, grid[${i}][-1] is never read)`;
      snap({
        title: { vi: `line 10: ${leftExprTitle}`, en: `line 10: ${leftExprTitleEn}` },
        cur: [i, j], peer: hasLeft ? [i, j - 1] : null, peerLabel: hasLeft ? "←" : null, codeLines: [10], total,
        vars: [
          { name: "j > 0?", value: hasLeft },
          { name: hasLeft ? `grid[${i}][${j - 1}]` : "grid[i][j-1]", value: hasLeft ? grid[i][j - 1] : "không đọc (short-circuit)" },
          { name: "left is land?", value: leftLand },
        ],
        note: {
          vi: !hasLeft
            ? `j=0 → "j > 0" là False → Python "and" NGẮT MẠCH ngay, không đọc grid[${i}][j-1] (tránh chỉ số âm sai) → bỏ qua line 11.`
            : leftLand
              ? `Ô bên trái (${i},${j - 1}) là đất → hai ô dính nhau → sang line 11 trừ cạnh chung.`
              : `Ô bên trái (${i},${j - 1}) là nước → không có cạnh chung để trừ.`,
          en: !hasLeft
            ? `j=0 → "j > 0" is False → Python's "and" SHORT-CIRCUITS immediately, grid[${i}][j-1] is never read (avoids a wrong negative index) → skip line 11.`
            : leftLand
              ? `Left cell (${i},${j - 1}) is land → the two cells touch → go to line 11 to subtract the shared edge.`
              : `Left cell (${i},${j - 1}) is water → no shared edge to subtract.`,
        },
      });
      if (leftLand) {
        // ── Line 11: total -= 2 ─────────────────────────────────────
        total -= 2;
        contrib[i][j] -= 2;
        snap({
          title: { vi: `line 11: total -= 2 → ${total}`, en: `line 11: total -= 2 → ${total}` },
          cur: [i, j], peer: [i, j - 1], peerLabel: "←", codeLines: [11], total,
          vars: [{ name: "cell contribution", value: contrib[i][j] }, { name: "total", value: total }],
          note: {
            vi: `Cạnh chung TRÁI giữa (${i},${j}) và (${i},${j - 1}) không phải biên → trừ 2 (1 cạnh cho mỗi ô, tổng cộng 2). total = ${total}.`,
            en: `The shared LEFT edge between (${i},${j}) and (${i},${j - 1}) is not a boundary → subtract 2 (1 edge for each cell, 2 total). total = ${total}.`,
          },
        });
      }

      // ── Line 12: check top neighbor ────────────────────────────────
      // Same short-circuit rule: when i==0, grid[i-1][j] is NEVER evaluated.
      const hasTop = i > 0;
      const topLand = hasTop && grid[i - 1][j] === 1;
      const topExprTitle = hasTop
        ? `i > 0 and grid[${i - 1}][${j}] == 1 → ${topLand}`
        : `i > 0 → False (dừng ở đây, không đọc grid[-1][${j}])`;
      const topExprTitleEn = hasTop
        ? `i > 0 and grid[${i - 1}][${j}] == 1 → ${topLand}`
        : `i > 0 → False (stops here, grid[-1][${j}] is never read)`;
      snap({
        title: { vi: `line 12: ${topExprTitle}`, en: `line 12: ${topExprTitleEn}` },
        cur: [i, j], peer: hasTop ? [i - 1, j] : null, peerLabel: hasTop ? "↑" : null, codeLines: [12], total,
        vars: [
          { name: "i > 0?", value: hasTop },
          { name: hasTop ? `grid[${i - 1}][${j}]` : "grid[i-1][j]", value: hasTop ? grid[i - 1][j] : "không đọc (short-circuit)" },
          { name: "top is land?", value: topLand },
        ],
        note: {
          vi: !hasTop
            ? `i=0 → "i > 0" là False → Python "and" NGẮT MẠCH ngay, không đọc grid[i-1][${j}] → bỏ qua line 13.`
            : topLand
              ? `Ô bên trên (${i - 1},${j}) là đất → hai ô dính nhau → sang line 13 trừ cạnh chung.`
              : `Ô bên trên (${i - 1},${j}) là nước → không có cạnh chung để trừ.`,
          en: !hasTop
            ? `i=0 → "i > 0" is False → Python's "and" SHORT-CIRCUITS immediately, grid[i-1][${j}] is never read → skip line 13.`
            : topLand
              ? `Top cell (${i - 1},${j}) is land → the two cells touch → go to line 13 to subtract the shared edge.`
              : `Top cell (${i - 1},${j}) is water → no shared edge to subtract.`,
        },
      });
      if (topLand) {
        // ── Line 13: total -= 2 ─────────────────────────────────────
        total -= 2;
        contrib[i][j] -= 2;
        snap({
          title: { vi: `line 13: total -= 2 → ${total}`, en: `line 13: total -= 2 → ${total}` },
          cur: [i, j], peer: [i - 1, j], peerLabel: "↑", codeLines: [13], total,
          vars: [{ name: "cell contribution", value: contrib[i][j] }, { name: "total", value: total }],
          note: {
            vi: `Cạnh chung TRÊN giữa (${i},${j}) và (${i - 1},${j}) không phải biên → trừ 2. total = ${total}.`,
            en: `The shared TOP edge between (${i},${j}) and (${i - 1},${j}) is not a boundary → subtract 2. total = ${total}.`,
          },
        });
      }

      snap({
        title: { vi: `Xong ô (${i},${j}): đóng góp net = ${contrib[i][j]}`, en: `Done with (${i},${j}): net contribution = ${contrib[i][j]}` },
        cur: [i, j], codeLines: [8, 9, 10, 11, 12, 13], total,
        vars: [{ name: "cell net contribution", value: contrib[i][j] }, { name: "total", value: total }],
        note: {
          vi: `(${i},${j}) đóng góp net ${contrib[i][j]} cạnh (4 trừ đi các cạnh dính trái/trên). Chuyển sang ô kế tiếp.`,
          en: `(${i},${j}) contributes a net of ${contrib[i][j]} edges (4 minus shared left/top edges). Move to the next cell.`,
        },
      });
    }
  }

  // ── Line 14 ─────────────────────────────────────────────────────────
  snap({
    title: { vi: `line 14: return ${total}`, en: `line 14: return ${total}` },
    final: true, codeLines: [14], total,
    vars: [{ name: "answer", value: total }],
    note: {
      vi: `Đã quét hết lưới. Tổng chu vi = ${total}. Cách này KHÔNG cần xét ô bên phải/dưới vì cặp đó sẽ được ô bên phải/dưới tự trừ khi tới lượt nó (tính từ góc nhìn trái/trên của nó).`,
      en: `Finished scanning. Total perimeter = ${total}. This approach never checks the right/bottom neighbor because that pair gets subtracted later, from the right/bottom cell's own left/top perspective.`,
    },
  });

  return { original: grid, answer: total, steps };
}

// ─── 1254: Number of Closed Islands — detailed line-by-line debugger ─────────
// code lines (1-indexed):
//  1  class Solution:
//  2      def closedIsland(self, grid):
//  3          rows, cols = len(grid), len(grid[0])
//  4          def dfs(r, c):
//  5              if r < 0 or r >= rows or c < 0 or c >= cols:
//  6                  return
//  7              if grid[r][c] != 0:
//  8                  return
//  9              grid[r][c] = 1
// 10              dfs(r+1, c)
// 11              dfs(r-1, c)
// 12              dfs(r, c+1)
// 13              dfs(r, c-1)
// 14          for r in range(rows):
// 15              dfs(r, 0)
// 16              dfs(r, cols-1)
// 17          for c in range(cols):
// 18              dfs(0, c)
// 19              dfs(rows-1, c)
// 20          count = 0
// 21          for r in range(1, rows-1):
// 22              for c in range(1, cols-1):
// 23                  if grid[r][c] == 0:
// 24                      dfs(r, c)
// 25                      count += 1
// 26          return count
function buildSteps1254(input) {
  const { valid, grid } = parseBinary(input, true);
  const steps = [];
  if (!valid || grid.length < 3 || grid[0].length < 3) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Grid phải gồm 0/1, kích thước tối thiểu 3×3. Ví dụ: 1111110|1000010|1011010|1000110|1111110.",
        en: "Grid must contain 0/1 and be at least 3×3. Example: 1111110|1000010|1011010|1000110|1111110.",
      },
    });
    return { original: [], answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const work = grid.map((row) => row.map(Number));
  const consumed = Array.from({ length: rows }, () => Array(cols).fill(false));
  const islandId = Array.from({ length: rows }, () => Array(cols).fill(0));
  let island = 0;
  let closedCount = 0;

  const callStack = [];
  const stackText = () => (callStack.length ? callStack.join(" → ") : "∅");

  // Cells shown as border/current/etc. + a #N tag on land absorbed into an island.
  function makeCells(cur) {
    return grid.map((row, r) => row.map((orig, c) => {
      const live = String(work[r][c]);
      const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      let cls = orig === "1" ? "wall" : isBorder ? "queued" : "empty";
      let meta = "";
      if (consumed[r][c]) {
        cls = work[r][c] === 1 ? "wall" : "visited";
        meta = islandId[r][c] ? `#${islandId[r][c]}` : "";
      }
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      return { label: live, meta, cls };
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title, arr: [], codeBlock: 1,
      bfsGrid: { rows, cols, cells: makeCells(o.cur || null) },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [
        ...(o.vars || []),
        { name: "call stack", value: stackText() },
        { name: "depth", value: callStack.length },
        { name: "count", value: closedCount },
      ],
      note: o.note,
    });
  }

  snap({
    title: { vi: "rows, cols = len(grid), len(grid[0])", en: "rows, cols = len(grid), len(grid[0])" },
    codeLines: [3],
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi:
        "Đảo 'closed' = nhóm ô đất (0) liên thông 4 hướng và KHÔNG chạm biên. " +
        "Chiến thuật: xóa (nhấn chìm) mọi đất chạm biên trước, phần đất còn lại chắc chắn là closed.",
      en:
        "A 'closed' island = a 4-connected group of land (0) that does NOT touch the border. " +
        "Strategy: flood away every border-touching land first; whatever land remains is guaranteed closed.",
    },
  });

  function dfs(r, c) {
    callStack.push(`dfs(${r},${c})`);

    const oob = r < 0 || r >= rows || c < 0 || c >= cols;
    snap({
      title: { vi: `dfs(${r},${c}) — line 5: kiểm tra biên`, en: `dfs(${r},${c}) — line 5: boundary check` },
      cur: oob ? null : [r, c], codeLines: [5],
      vars: [{ name: "r, c", value: `${r}, ${c}` }, { name: "out of bounds?", value: oob }],
      note: {
        vi: oob ? `(${r},${c}) nằm NGOÀI grid → line 6 return.` : `(${r},${c}) trong grid → sang line 7.`,
        en: oob ? `(${r},${c}) is OUTSIDE the grid → line 6 return.` : `(${r},${c}) is inside → go to line 7.`,
      },
    });
    if (oob) {
      snap({
        title: { vi: "line 6: return (ngoài biên)", en: "line 6: return (out of bounds)" },
        codeLines: [6], vars: [],
        note: { vi: "Ngoài grid, không làm gì.", en: "Outside the grid, do nothing." },
      });
      callStack.pop();
      return;
    }

    const notLand = work[r][c] !== 0;
    snap({
      title: { vi: `dfs(${r},${c}) — line 7: grid[r][c] != 0?`, en: `dfs(${r},${c}) — line 7: grid[r][c] != 0?` },
      cur: [r, c], codeLines: [7],
      vars: [{ name: "grid[r][c] (live)", value: work[r][c] }, { name: "not land?", value: notLand }],
      note: {
        vi: notLand
          ? `grid[${r}][${c}] = ${work[r][c]} (nước hoặc đã ngập) → line 8 return.`
          : `grid[${r}][${c}] = 0 (đất chưa thăm) → sang line 9.`,
        en: notLand
          ? `grid[${r}][${c}] = ${work[r][c]} (water or already flooded) → line 8 return.`
          : `grid[${r}][${c}] = 0 (unvisited land) → go to line 9.`,
      },
    });
    if (notLand) {
      snap({
        title: { vi: "line 8: return (nước / đã ngập)", en: "line 8: return (water / already flooded)" },
        cur: [r, c], codeLines: [8], vars: [],
        note: { vi: "Không phải đất chưa thăm — dừng nhánh này.", en: "Not unvisited land — stop this branch." },
      });
      callStack.pop();
      return;
    }

    const before = work.map((row) => row.join("")).join(" | ");
    work[r][c] = 1;
    consumed[r][c] = true;
    if (island > 0) islandId[r][c] = island;
    const after = work.map((row) => row.join("")).join(" | ");
    snap({
      title: { vi: `line 9: grid[${r}][${c}] = 1  ⟵ 0 bị ghi thành 1`, en: `line 9: grid[${r}][${c}] = 1  ⟵ 0 overwritten to 1` },
      cur: [r, c], codeLines: [9],
      vars: [
        { name: "grid[r][c] trước", value: 0 }, { name: "grid[r][c] sau", value: 1 },
        { name: "grid trước", value: before }, { name: "grid sau", value: after },
      ],
      note: {
        vi: `"Nhấn chìm" (${r},${c}) thành nước để không đếm lại. Đây là cách đánh dấu visited không cần mảng riêng.\ngrid: ${before}  →  ${after}`,
        en: `"Flood" (${r},${c}) into water so it's never counted again. This marks it visited without a separate array.\ngrid: ${before}  →  ${after}`,
      },
    });

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
        title: { vi: `line ${line}: ${label} trả về → quay lại dfs(${r},${c})`, en: `line ${line}: ${label} returned → back in dfs(${r},${c})` },
        cur: [r, c], codeLines: [line], vars: [],
        note: { vi: `Pop frame, tiếp tục dfs(${r},${c}).`, en: `Pop the frame, resume dfs(${r},${c}).` },
      });
    }
    callStack.pop();
  }

  // ── Lines 14–16: flood land touching left/right border ────────────────
  for (let r = 0; r < rows; r++) {
    snap({
      title: { vi: `line 14: for r in range(rows) → r = ${r}`, en: `line 14: for r in range(rows) → r = ${r}` },
      codeLines: [14], vars: [{ name: "r", value: r }],
      note: { vi: `Nhấn chìm đất chạm cột trái/phải ở hàng ${r}.`, en: `Flood land touching the left/right column on row ${r}.` },
    });
    snap({
      title: { vi: `line 15: dfs(${r}, 0)`, en: `line 15: dfs(${r}, 0)` },
      cur: [r, 0], codeLines: [15], vars: [],
      note: { vi: `Bắt đầu từ cột TRÁI, hàng ${r}.`, en: `Start from the LEFT column, row ${r}.` },
    });
    dfs(r, 0);
    snap({
      title: { vi: `line 16: dfs(${r}, ${cols - 1})`, en: `line 16: dfs(${r}, ${cols - 1})` },
      cur: [r, cols - 1], codeLines: [16], vars: [],
      note: { vi: `Bắt đầu từ cột PHẢI, hàng ${r}.`, en: `Start from the RIGHT column, row ${r}.` },
    });
    dfs(r, cols - 1);
  }

  // ── Lines 17–19: flood land touching top/bottom border ────────────────
  for (let c = 0; c < cols; c++) {
    snap({
      title: { vi: `line 17: for c in range(cols) → c = ${c}`, en: `line 17: for c in range(cols) → c = ${c}` },
      codeLines: [17], vars: [{ name: "c", value: c }],
      note: { vi: `Nhấn chìm đất chạm hàng trên/dưới ở cột ${c}.`, en: `Flood land touching the top/bottom row on column ${c}.` },
    });
    snap({
      title: { vi: `line 18: dfs(0, ${c})`, en: `line 18: dfs(0, ${c})` },
      cur: [0, c], codeLines: [18], vars: [],
      note: { vi: `Bắt đầu từ hàng TRÊN, cột ${c}.`, en: `Start from the TOP row, column ${c}.` },
    });
    dfs(0, c);
    snap({
      title: { vi: `line 19: dfs(${rows - 1}, ${c})`, en: `line 19: dfs(${rows - 1}, ${c})` },
      cur: [rows - 1, c], codeLines: [19], vars: [],
      note: { vi: `Bắt đầu từ hàng DƯỚI, cột ${c}.`, en: `Start from the BOTTOM row, column ${c}.` },
    });
    dfs(rows - 1, c);
  }

  // ── Line 20 ─────────────────────────────────────────────────────────
  snap({
    title: { vi: "count = 0", en: "count = 0" },
    codeLines: [20], vars: [],
    note: {
      vi: "Mọi đất chạm biên đã bị nhấn chìm. Đất còn lại (nếu có) chắc chắn là closed island.",
      en: "Every border-touching land has been flooded. Any remaining land is guaranteed to be a closed island.",
    },
  });

  // ── Lines 21–25: count closed islands strictly inside ───────────────
  for (let r = 1; r < rows - 1; r++) {
    snap({
      title: { vi: `line 21: for r in range(1, rows-1) → r = ${r}`, en: `line 21: for r in range(1, rows-1) → r = ${r}` },
      codeLines: [21], vars: [{ name: "r", value: r }],
      note: { vi: `Quét hàng ${r} (chỉ phần bên trong, không tính biên).`, en: `Scan row ${r} (interior only, border excluded).` },
    });
    for (let c = 1; c < cols - 1; c++) {
      snap({
        title: { vi: `line 22: for c in range(1, cols-1) → c = ${c}`, en: `line 22: for c in range(1, cols-1) → c = ${c}` },
        cur: [r, c], codeLines: [22],
        vars: [{ name: "grid[r][c] (live)", value: work[r][c] }],
        note: { vi: `Xét ô (${r},${c}).`, en: `Inspect cell (${r},${c}).` },
      });
      const isLand = work[r][c] === 0;
      snap({
        title: { vi: `line 23: grid[${r}][${c}] == 0? → ${isLand}`, en: `line 23: grid[${r}][${c}] == 0? → ${isLand}` },
        cur: [r, c], codeLines: [23],
        vars: [{ name: "is unflooded land?", value: isLand }],
        note: {
          vi: isLand ? `Đất còn sót → đây là MỘT ĐẢO CLOSED mới → line 24-25.` : `Không phải đất (đã ngập hoặc là nước) → bỏ qua.`,
          en: isLand ? `Remaining land → this is a NEW CLOSED ISLAND → line 24-25.` : `Not land (already flooded or water) → skip.`,
        },
      });
      if (!isLand) continue;
      island += 1;
      snap({
        title: { vi: `line 24: dfs(${r}, ${c}) — nhấn chìm đảo closed #${island}`, en: `line 24: dfs(${r}, ${c}) — flood closed island #${island}` },
        cur: [r, c], codeLines: [24],
        vars: [{ name: "island #", value: island }],
        note: { vi: `Gọi DFS để nhấn chìm toàn bộ đảo closed #${island} (chỉ để loại trừ, không tính lại).`, en: `Call DFS to flood the entire closed island #${island} (purely to avoid recounting it).` },
      });
      dfs(r, c);
      closedCount += 1;
      snap({
        title: { vi: `line 25: count += 1 → ${closedCount}`, en: `line 25: count += 1 → ${closedCount}` },
        codeLines: [25],
        vars: [{ name: "count", value: closedCount }],
        note: { vi: `Đảo closed #${island} đã được đếm. count = ${closedCount}.`, en: `Closed island #${island} counted. count = ${closedCount}.` },
      });
    }
  }

  snap({
    title: { vi: `line 26: return ${closedCount}`, en: `line 26: return ${closedCount}` },
    final: true, codeLines: [26],
    vars: [{ name: "answer", value: closedCount }],
    note: {
      vi: `Đã quét hết grid. Số đảo closed (không chạm biên) = ${closedCount}.`,
      en: `Finished scanning. Number of closed islands (not touching the border) = ${closedCount}.`,
    },
  });

  return { original: grid, answer: closedCount, steps };
}

// ─── 1905 Approach 2: recursive DFS returning bool — line-by-line debugger ───
// code2 lines (1-indexed):
//  1  class Solution:
//  2      def countSubIslands(self, grid1, grid2):
//  3          rows = len(grid2)
//  4          cols = len(grid2[0])
//  5          def dfs(row, col):
//  6              if (row < 0 or row >= rows or
//  7                      col < 0 or col >= cols or
//  8                      grid2[row][col] == 0):
//  9                  return True
// 10              is_sub_island = grid1[row][col] == 1
// 11              grid2[row][col] = 0
// 12              up = dfs(row - 1, col)
// 13              down = dfs(row + 1, col)
// 14              left = dfs(row, col - 1)
// 15              right = dfs(row, col + 1)
// 16              return (is_sub_island and up and down and left and right)
// 17          result = 0
// 18          for row in range(rows):
// 19              for col in range(cols):
// 20                  if grid2[row][col] == 1:
// 21                      if dfs(row, col):
// 22                          result += 1
// 23          return result
function buildSteps1905v2(input) {
  const parsed = parseGridPair(input);
  const original = { grid1: parsed.grid1?.map((r) => [...r]) || [], grid2: parsed.grid2?.map((r) => [...r]) || [] };
  if (!parsed.valid) {
    return invalid(original, tr("Nhập grid1;grid2, mỗi grid dùng '|' ngăn hàng và chỉ gồm 0/1.", "Enter grid1;grid2, using '|' between rows; both grids must contain only 0/1."));
  }
  const grid1 = parsed.grid1.map((r) => [...r]);
  const grid2 = parsed.grid2.map((r) => [...r]);
  const rows = grid2.length;
  const cols = grid2[0].length;
  const steps = [];

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const callStack = [];
  const stackText = () => (callStack.length ? callStack.join(" → ") : "∅");
  let result = 0;

  function makeCells(cur) {
    return grid2.map((row, r) => row.map((v, c) => {
      const onLand1 = grid1[r][c] === 1;
      let cls = v === 0 ? (visited[r][c] ? "visited" : "wall") : "empty";
      // Tint land that is NOT over grid1 land, so it's obvious why is_sub_island is False.
      if (v === 1 && !onLand1) cls = "queued";
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      return { label: String(v), meta: onLand1 ? "" : (v === 0 ? "" : "¬g1"), cls };
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title, arr: [], codeBlock: 2,
      bfsGrid: { rows, cols, cells: makeCells(o.cur || null) },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [
        ...(o.vars || []),
        { name: "call stack", value: stackText() },
        { name: "depth", value: callStack.length },
        { name: "result", value: result },
      ],
      note: o.note,
    });
  }

  snap({
    title: { vi: "rows = len(grid2); cols = len(grid2[0])", en: "rows = len(grid2); cols = len(grid2[0])" },
    codeLines: [3, 4],
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi:
        "Cách khác: dfs(row,col) trả về BOOLEAN — True nếu toàn bộ đảo (từ ô này lan ra) đều nằm trên đất grid1. " +
        "Ô ngoài biên/nước trả True 'rỗng' (vacuously true) vì không góp phần phá điều kiện. Ô mang nhãn '¬g1' là đất grid2 KHÔNG nằm trên đất grid1.",
      en:
        "Different structure: dfs(row,col) returns a BOOLEAN — True if the entire island (spreading from this cell) lies over grid1 land. " +
        "Out-of-bounds/water cells vacuously return True since they can't break the condition. Cells tagged '¬g1' are grid2 land NOT over grid1 land.",
    },
  });

  function dfs(row, col) {
    callStack.push(`dfs(${row},${col})`);

    const oob = row < 0 || row >= rows || col < 0 || col >= cols;
    const isWater = !oob && grid2[row][col] === 0;
    const stopCond = oob || isWater;
    snap({
      title: { vi: `dfs(${row},${col}) — line 6-8: kiểm tra điều kiện dừng`, en: `dfs(${row},${col}) — line 6-8: check stop condition` },
      cur: oob ? null : [row, col], codeLines: [6, 7, 8],
      vars: [
        { name: "row, col", value: `${row}, ${col}` },
        { name: "out of bounds?", value: oob },
        { name: "grid2[row][col]", value: oob ? "—" : grid2[row][col] },
      ],
      note: {
        vi: stopCond
          ? `${oob ? `(${row},${col}) ngoài biên` : `grid2[${row}][${col}]=0 (nước/đã thăm)`} → line 9 return True (không phá điều kiện).`
          : `(${row},${col}) là đất grid2 chưa thăm → tiếp tục sang line 10.`,
        en: stopCond
          ? `${oob ? `(${row},${col}) is out of bounds` : `grid2[${row}][${col}]=0 (water/visited)`} → line 9 return True (cannot break the condition).`
          : `(${row},${col}) is unvisited grid2 land → continue to line 10.`,
      },
    });
    if (stopCond) {
      snap({
        title: { vi: "line 9: return True (vacuously true)", en: "line 9: return True (vacuously true)" },
        codeLines: [9], vars: [{ name: "returns", value: true }],
        note: { vi: "Ô ngoài biên hoặc nước không thể làm is_sub_island sai → trả True.", en: "An out-of-bounds or water cell can never make is_sub_island false → return True." },
      });
      callStack.pop();
      return true;
    }

    // ── Line 10: remember whether this cell sits on grid1 land ─────────
    const isSubIsland = grid1[row][col] === 1;
    snap({
      title: { vi: `line 10: is_sub_island = grid1[${row}][${col}] == 1 → ${isSubIsland}`, en: `line 10: is_sub_island = grid1[${row}][${col}] == 1 → ${isSubIsland}` },
      cur: [row, col], codeLines: [10],
      vars: [{ name: "grid1[row][col]", value: grid1[row][col] }, { name: "is_sub_island", value: isSubIsland }],
      note: {
        vi: isSubIsland
          ? `grid1[${row}][${col}]=1 → ô này NẰM TRÊN đất grid1 → is_sub_island=True (chưa kết luận, còn phụ thuộc 4 hướng).`
          : `grid1[${row}][${col}]=0 → ô này KHÔNG nằm trên đất grid1 → is_sub_island=False → cả đảo chắc chắn KHÔNG phải sub-island.`,
        en: isSubIsland
          ? `grid1[${row}][${col}]=1 → this cell IS over grid1 land → is_sub_island=True (not final yet, depends on the 4 directions too).`
          : `grid1[${row}][${col}]=0 → this cell is NOT over grid1 land → is_sub_island=False → the whole island CANNOT be a sub-island.`,
      },
    });

    // ── Line 11: mark visited by flooding to water ──────────────────────
    const before = grid2.map((r) => r.join("")).join(" | ");
    grid2[row][col] = 0;
    visited[row][col] = true;
    const after = grid2.map((r) => r.join("")).join(" | ");
    snap({
      title: { vi: `line 11: grid2[${row}][${col}] = 0  ⟵ 1 bị ghi thành 0`, en: `line 11: grid2[${row}][${col}] = 0  ⟵ 1 overwritten to 0` },
      cur: [row, col], codeLines: [11],
      vars: [{ name: "grid2[row][col] trước", value: 1 }, { name: "grid2[row][col] sau", value: 0 }, { name: "grid2 trước", value: before }, { name: "grid2 sau", value: after }],
      note: {
        vi: `Đánh dấu (${row},${col}) đã thăm bằng cách "nhấn chìm" nó — dùng chính grid2 làm mảng visited.\ngrid2: ${before}  →  ${after}`,
        en: `Mark (${row},${col}) visited by "flooding" it — grid2 itself doubles as the visited array.\ngrid2: ${before}  →  ${after}`,
      },
    });

    // ── Lines 12-15: recurse in 4 directions, ALWAYS (no short-circuit) ──
    const DIRS = [
      { dr: -1, dc: 0, line: 12, varName: "up", label: "dfs(row-1, col)" },
      { dr: 1, dc: 0, line: 13, varName: "down", label: "dfs(row+1, col)" },
      { dr: 0, dc: -1, line: 14, varName: "left", label: "dfs(row, col-1)" },
      { dr: 0, dc: 1, line: 15, varName: "right", label: "dfs(row, col+1)" },
    ];
    const results = {};
    for (const { dr, dc, line, varName, label } of DIRS) {
      const nr = row + dr;
      const nc = col + dc;
      snap({
        title: { vi: `line ${line}: ${varName} = gọi ${label}`, en: `line ${line}: ${varName} = call ${label}` },
        cur: [row, col], codeLines: [line],
        vars: [{ name: "calling", value: `dfs(${nr},${nc})` }],
        note: {
          vi: `LƯU Ý: cả 4 hướng đều được gọi (không có short-circuit "and" ở đây) — Python luôn đánh giá cả 4 trước khi return ở line 16.`,
          en: `NOTE: all 4 directions are always called (no short-circuiting here) — Python evaluates all 4 before the return on line 16.`,
        },
      });
      const childResult = dfs(nr, nc);
      results[varName] = childResult;
      snap({
        title: { vi: `line ${line}: ${varName} = ${childResult}`, en: `line ${line}: ${varName} = ${childResult}` },
        cur: [row, col], codeLines: [line],
        vars: [{ name: varName, value: childResult }],
        note: { vi: `${label} trả về ${childResult}. Gán vào biến ${varName}.`, en: `${label} returned ${childResult}. Stored in ${varName}.` },
      });
    }

    // ── Line 16: combine ─────────────────────────────────────────────────
    const finalResult = isSubIsland && results.up && results.down && results.left && results.right;
    snap({
      title: { vi: `line 16: return (is_sub_island and up and down and left and right) → ${finalResult}`, en: `line 16: return (is_sub_island and up and down and left and right) → ${finalResult}` },
      cur: [row, col], codeLines: [16],
      vars: [
        { name: "is_sub_island", value: isSubIsland },
        { name: "up", value: results.up }, { name: "down", value: results.down },
        { name: "left", value: results.left }, { name: "right", value: results.right },
        { name: "returns", value: finalResult },
      ],
      note: {
        vi: `dfs(${row},${col}) = ${isSubIsland} AND ${results.up} AND ${results.down} AND ${results.left} AND ${results.right} = ${finalResult}.`,
        en: `dfs(${row},${col}) = ${isSubIsland} AND ${results.up} AND ${results.down} AND ${results.left} AND ${results.right} = ${finalResult}.`,
      },
    });
    callStack.pop();
    return finalResult;
  }

  snap({
    title: { vi: "result = 0", en: "result = 0" },
    codeLines: [17], vars: [],
    note: { vi: "Khởi tạo bộ đếm sub-island.", en: "Initialize the sub-island counter." },
  });

  for (let row = 0; row < rows; row++) {
    snap({
      title: { vi: `line 18: for row in range(rows) → row = ${row}`, en: `line 18: for row in range(rows) → row = ${row}` },
      codeLines: [18], vars: [{ name: "row", value: row }],
      note: { vi: `Quét hàng ${row}.`, en: `Scan row ${row}.` },
    });
    for (let col = 0; col < cols; col++) {
      snap({
        title: { vi: `line 19: for col in range(cols) → col = ${col}`, en: `line 19: for col in range(cols) → col = ${col}` },
        cur: [row, col], codeLines: [19], vars: [{ name: "col", value: col }],
        note: { vi: `Xét ô (${row},${col}).`, en: `Inspect cell (${row},${col}).` },
      });
      const isLand = grid2[row][col] === 1;
      snap({
        title: { vi: `line 20: grid2[${row}][${col}] == 1? → ${isLand}`, en: `line 20: grid2[${row}][${col}] == 1? → ${isLand}` },
        cur: [row, col], codeLines: [20],
        vars: [{ name: "grid2[row][col]", value: grid2[row][col] }, { name: "is land?", value: isLand }],
        note: {
          vi: isLand ? `Đất chưa thăm → gọi dfs(${row},${col}) ở line 21.` : `Không phải đất mới → bỏ qua.`,
          en: isLand ? `Unvisited land → call dfs(${row},${col}) at line 21.` : `Not new land → skip.`,
        },
      });
      if (!isLand) continue;
      snap({
        title: { vi: `line 21: if dfs(${row}, ${col})`, en: `line 21: if dfs(${row}, ${col})` },
        cur: [row, col], codeLines: [21], vars: [],
        note: { vi: `Gọi dfs từ đảo mới, kiểm tra xem toàn đảo có phải sub-island.`, en: `Call dfs from a new island, checking whether the whole island is a sub-island.` },
      });
      const isSub = dfs(row, col);
      if (isSub) {
        result += 1;
        snap({
          title: { vi: `line 22: result += 1 → ${result}`, en: `line 22: result += 1 → ${result}` },
          codeLines: [22], vars: [{ name: "result", value: result }],
          note: { vi: `dfs trả True → đây là một sub-island → result = ${result}.`, en: `dfs returned True → this is a sub-island → result = ${result}.` },
        });
      } else {
        snap({
          title: { vi: `line 21: dfs trả False → không tăng result`, en: `line 21: dfs returned False → result unchanged` },
          codeLines: [21], vars: [],
          note: { vi: `Đảo này có ít nhất 1 ô không nằm trên đất grid1 → không phải sub-island.`, en: `This island has at least one cell not over grid1 land → not a sub-island.` },
        });
      }
    }
  }

  snap({
    title: { vi: `line 23: return ${result}`, en: `line 23: return ${result}` },
    final: true, codeLines: [23],
    vars: [{ name: "answer", value: result }],
    note: { vi: `Đã quét hết grid2. Số sub-island = ${result}.`, en: `Finished scanning grid2. Number of sub-islands = ${result}.` },
  });

  return { original, answer: result, steps };
}

// ─── 1568: Minimum Number of Days to Disconnect Island — line-by-line ────────
// code lines (1-indexed):
//  1  class Solution:
//  2      def minDays(self, grid):
//  3          rows, cols = len(grid), len(grid[0])
//  4          def count_islands(g):
//  5              visited = [[False]*cols for _ in range(rows)]
//  6              def dfs(r, c):
//  7                  stack = [(r, c)]; visited[r][c] = True
//  8                  while stack:
//  9                      cr, cc = stack.pop()
// 10                      for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
// 11                          nr, nc = cr+dr, cc+dc
// 12                          if 0<=nr<rows and 0<=nc<cols and g[nr][nc]==1 and not visited[nr][nc]:
// 13                              visited[nr][nc] = True; stack.append((nr,nc))
// 14              count = 0
// 15              for r in range(rows):
// 16                  for c in range(cols):
// 17                      if g[r][c]==1 and not visited[r][c]:
// 18                          count += 1; dfs(r, c)
// 19              return count
// 20          if count_islands(grid) != 1:
// 21              return 0
// 22          for r in range(rows):
// 23              for c in range(cols):
// 24                  if grid[r][c] == 1:
// 25                      grid[r][c] = 0
// 26                      if count_islands(grid) != 1:
// 27                          grid[r][c] = 1
// 28                          return 1
// 29                      grid[r][c] = 1
// 30          return 2
function buildSteps1568(input) {
  const { valid, grid } = parseBinary(input, false);
  const steps = [];
  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true, codeLines: [3], vars: [{ name: "answer", value: 0 }],
      note: { vi: "Grid phải gồm 0/1. Ví dụ: 0110|0110|0000.", en: "Grid must contain 0/1. Example: 0110|0110|0000." },
    });
    return { original: [], answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const work = grid.map((row) => [...row]);
  const callStack = [];
  const stackText = () => (callStack.length ? callStack.join(" → ") : "∅");

  // Renders the live `work` grid, overlaying the current DFS `visited` set
  // (if provided) and marking the trial-removed cell in a distinct color.
  function makeCells(visited, cur, removedCell) {
    return work.map((row, r) => row.map((v, c) => {
      let cls = v === 0 ? "wall" : (visited && visited[r][c]) ? "visited" : "empty";
      if (removedCell && removedCell[0] === r && removedCell[1] === c) cls = "queued";
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      return { label: String(v), cls };
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title, arr: [],
      bfsGrid: { rows, cols, cells: makeCells(o.visited || null, o.cur || null, o.removed || null) },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [
        ...(o.vars || []),
        { name: "call stack", value: stackText() },
      ],
      note: o.note,
    });
  }

  // ── count_islands(g), FULLY traced every single time it's called ────────
  // (initial check AND every one of the rows*cols trial removals).
  // contextLabel + removedCell let the viewer see WHICH call this is.
  function countIslands(contextLabel, removedCell) {
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    snap({
      title: { vi: `${contextLabel} — line 5: visited = ma trận False`, en: `${contextLabel} — line 5: visited = all-False grid` },
      removed: removedCell, codeLines: [5],
      vars: [{ name: "rows,cols", value: `${rows},${cols}` }],
      note: { vi: "Tạo mảng visited cùng kích thước grid, khởi tạo toàn False.", en: "Create a visited array the same size as grid, initialized to all False." },
    });

    let count = 0;
    snap({
      title: { vi: `${contextLabel} — line 14: count = 0`, en: `${contextLabel} — line 14: count = 0` },
      removed: removedCell, visited, codeLines: [14], vars: [{ name: "count", value: 0 }],
      note: { vi: "Khởi tạo bộ đếm số đảo.", en: "Initialize the island counter." },
    });

    for (let r = 0; r < rows; r++) {
      snap({
        title: { vi: `${contextLabel} — line 15: for r in range(rows) → r = ${r}`, en: `${contextLabel} — line 15: for r in range(rows) → r = ${r}` },
        removed: removedCell, visited, codeLines: [15], vars: [{ name: "r", value: r }, { name: "count", value: count }],
        note: { vi: `Quét hàng ${r}.`, en: `Scan row ${r}.` },
      });
      for (let c = 0; c < cols; c++) {
        snap({
          title: { vi: `${contextLabel} — line 16: for c in range(cols) → c = ${c}`, en: `${contextLabel} — line 16: for c in range(cols) → c = ${c}` },
          removed: removedCell, visited, cur: [r, c], codeLines: [16], vars: [{ name: "c", value: c }, { name: "count", value: count }],
          note: { vi: `Xét ô (${r},${c}).`, en: `Inspect cell (${r},${c}).` },
        });
        const isNewLand = work[r][c] === 1 && !visited[r][c];
        snap({
          title: { vi: `${contextLabel} — line 17: g[${r}][${c}]==1 and not visited[${r}][${c}] → ${isNewLand}`, en: `${contextLabel} — line 17: g[${r}][${c}]==1 and not visited[${r}][${c}] → ${isNewLand}` },
          removed: removedCell, visited, cur: [r, c], codeLines: [17],
          vars: [{ name: "g[r][c]", value: work[r][c] }, { name: "visited[r][c]", value: visited[r][c] }, { name: "is new land?", value: isNewLand }],
          note: {
            vi: isNewLand ? `Đất chưa thăm → đảo mới → line 18.` : `Nước hoặc đã thăm → bỏ qua.`,
            en: isNewLand ? `Unvisited land → a new island → line 18.` : `Water or already visited → skip.`,
          },
        });
        if (!isNewLand) continue;

        count += 1;
        snap({
          title: { vi: `${contextLabel} — line 18: count += 1 → ${count}; gọi dfs(${r},${c})`, en: `${contextLabel} — line 18: count += 1 → ${count}; call dfs(${r},${c})` },
          removed: removedCell, visited, cur: [r, c], codeLines: [18],
          vars: [{ name: "count", value: count }],
          note: { vi: `Đảo thứ ${count}. Gọi dfs(${r},${c}) để tô hết đảo này.`, en: `Island #${count}. Call dfs(${r},${c}) to flood the entire island.` },
        });

        // ── dfs(r, c): fully traced iterative flood fill ──────────────────
        callStack.push(`dfs(${r},${c})`);
        const stack = [[r, c]];
        visited[r][c] = true;
        snap({
          title: { vi: `dfs(${r},${c}) — line 7: stack=[(${r},${c})]; visited[${r}][${c}]=True`, en: `dfs(${r},${c}) — line 7: stack=[(${r},${c})]; visited[${r}][${c}]=True` },
          removed: removedCell, visited, cur: [r, c], codeLines: [7],
          vars: [{ name: "stack", value: `[(${r},${c})]` }],
          note: { vi: `Khởi tạo stack với ô gốc, đánh dấu đã thăm.`, en: `Seed the stack with the root cell, mark it visited.` },
        });

        let guard = 0;
        while (stack.length && guard++ < rows * cols * 4) {
          snap({
            title: { vi: `dfs(${r},${c}) — line 8: while stack → True (len=${stack.length})`, en: `dfs(${r},${c}) — line 8: while stack → True (len=${stack.length})` },
            removed: removedCell, visited, codeLines: [8],
            vars: [{ name: "stack", value: `[${stack.map(([a, b]) => `(${a},${b})`).join(", ")}]` }],
            note: { vi: "Stack còn ô cần xử lý.", en: "The stack still has cells to process." },
          });
          const [cr, cc] = stack.pop();
          snap({
            title: { vi: `dfs(${r},${c}) — line 9: cr,cc = stack.pop() → (${cr},${cc})`, en: `dfs(${r},${c}) — line 9: cr,cc = stack.pop() → (${cr},${cc})` },
            removed: removedCell, visited, cur: [cr, cc], codeLines: [9],
            vars: [{ name: "cr, cc", value: `${cr}, ${cc}` }],
            note: { vi: `Lấy (${cr},${cc}) khỏi đỉnh stack.`, en: `Pop (${cr},${cc}) off the top of the stack.` },
          });
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = cr + dr;
            const nc = cc + dc;
            snap({
              title: { vi: `dfs(${r},${c}) — line 10-11: dr,dc=(${dr},${dc}) → next=(${nr},${nc})`, en: `dfs(${r},${c}) — line 10-11: dr,dc=(${dr},${dc}) → next=(${nr},${nc})` },
              removed: removedCell, visited, cur: [cr, cc], codeLines: [10, 11],
              vars: [{ name: "dr, dc", value: `${dr}, ${dc}` }, { name: "nr, nc", value: `${nr}, ${nc}` }],
              note: { vi: `Xét hàng xóm (${nr},${nc}).`, en: `Check neighbor (${nr},${nc}).` },
            });
            const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
            const canVisit = inBounds && work[nr][nc] === 1 && !visited[nr][nc];
            snap({
              title: { vi: `dfs(${r},${c}) — line 12: trong lưới, là đất, chưa thăm → ${canVisit}`, en: `dfs(${r},${c}) — line 12: in bounds, land, unvisited → ${canVisit}` },
              removed: removedCell, visited, cur: inBounds ? [nr, nc] : [cr, cc], codeLines: [12],
              vars: [{ name: "in bounds?", value: inBounds }, { name: "g[nr][nc]", value: inBounds ? work[nr][nc] : "—" }, { name: "can visit?", value: canVisit }],
              note: {
                vi: canVisit ? `(${nr},${nc}) hợp lệ → line 13 đánh dấu và đẩy vào stack.` : `Ngoài lưới, nước, hoặc đã thăm → bỏ qua.`,
                en: canVisit ? `(${nr},${nc}) is valid → line 13 marks it and pushes it.` : `Out of bounds, water, or already visited → skip.`,
              },
            });
            if (canVisit) {
              visited[nr][nc] = true;
              stack.push([nr, nc]);
              snap({
                title: { vi: `dfs(${r},${c}) — line 13: visited[${nr}][${nc}]=True; stack.append((${nr},${nc}))`, en: `dfs(${r},${c}) — line 13: visited[${nr}][${nc}]=True; stack.append((${nr},${nc}))` },
                removed: removedCell, visited, cur: [nr, nc], codeLines: [13],
                vars: [{ name: "stack", value: `[${stack.map(([a, b]) => `(${a},${b})`).join(", ")}]` }],
                note: { vi: `Đánh dấu (${nr},${nc}) đã thăm và đẩy vào stack để xử lý tiếp.`, en: `Mark (${nr},${nc}) visited and push it for later processing.` },
              });
            }
          }
        }
        snap({
          title: { vi: `dfs(${r},${c}) — line 8: while stack → False (rỗng)`, en: `dfs(${r},${c}) — line 8: while stack → False (empty)` },
          removed: removedCell, visited, codeLines: [8], vars: [],
          note: { vi: `Đảo #${count} đã được tô hết. Quay lại vòng lặp chính.`, en: `Island #${count} fully flooded. Return to the main loop.` },
        });
        callStack.pop();
      }
    }

    snap({
      title: { vi: `${contextLabel} — line 19: return count = ${count}`, en: `${contextLabel} — line 19: return count = ${count}` },
      removed: removedCell, visited, codeLines: [19],
      vars: [{ name: "count", value: count }],
      note: { vi: `count_islands trả về ${count}.`, en: `count_islands returns ${count}.` },
    });
    return count;
  }

  // ── Line 3 ──────────────────────────────────────────────────────────
  snap({
    title: { vi: "rows, cols = len(grid), len(grid[0])", en: "rows, cols = len(grid), len(grid[0])" },
    codeLines: [3],
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi:
        "Chìa khóa: đáp án CHỈ CÓ THỂ là 0, 1, hoặc 2.\n" +
        "0: lưới đã rời (0 hoặc ≥2 đảo). 1: xóa đúng 1 ô đất làm rời lưới. 2: mọi trường hợp còn lại (luôn xóa được bằng 2 ô).",
      en:
        "Key insight: the answer can ONLY be 0, 1, or 2.\n" +
        "0: already disconnected (0 or ≥2 islands). 1: removing exactly one land cell disconnects it. 2: every other case (always achievable with 2 cells).",
    },
  });

  // ── Line 20: initial count_islands call, fully traced ──────────────────
  const initialCount = countIslands("Gọi ban đầu / Initial call", null);
  snap({
    title: { vi: `line 20: count_islands(grid) != 1 → ${initialCount !== 1}`, en: `line 20: count_islands(grid) != 1 → ${initialCount !== 1}` },
    codeLines: [20],
    vars: [{ name: "count_islands(grid)", value: initialCount }],
    note: {
      vi: initialCount !== 1
        ? `Grid có ${initialCount} đảo (0 hoặc ≥2) → đã rời sẵn → line 21 return 0.`
        : `Grid có đúng 1 đảo → chưa rời, cần thử xóa ô để tách.`,
      en: initialCount !== 1
        ? `Grid has ${initialCount} islands (0 or ≥2) → already disconnected → line 21 return 0.`
        : `Grid has exactly 1 island → not yet disconnected, need to try removing cells.`,
    },
  });
  if (initialCount !== 1) {
    snap({
      title: { vi: "line 21: return 0", en: "line 21: return 0" },
      final: true, codeLines: [21],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Đã rời sẵn → 0 ngày.", en: "Already disconnected → 0 days." },
    });
    return { original: grid, answer: 0, steps };
  }

  // ── Lines 22-29: try removing each land cell, fully traced ─────────────
  for (let r = 0; r < rows; r++) {
    snap({
      title: { vi: `line 22: for r in range(rows) → r = ${r}`, en: `line 22: for r in range(rows) → r = ${r}` },
      codeLines: [22], vars: [{ name: "r", value: r }],
      note: { vi: `Thử xóa từng ô đất ở hàng ${r}.`, en: `Try removing each land cell in row ${r}.` },
    });
    for (let c = 0; c < cols; c++) {
      snap({
        title: { vi: `line 23: for c in range(cols) → c = ${c}`, en: `line 23: for c in range(cols) → c = ${c}` },
        cur: [r, c], codeLines: [23], vars: [{ name: "c", value: c }],
        note: { vi: `Xét ô (${r},${c}).`, en: `Inspect cell (${r},${c}).` },
      });
      const isLand = work[r][c] === 1;
      snap({
        title: { vi: `line 24: grid[${r}][${c}] == 1? → ${isLand}`, en: `line 24: grid[${r}][${c}] == 1? → ${isLand}` },
        cur: [r, c], codeLines: [24], vars: [{ name: "is land?", value: isLand }],
        note: {
          vi: isLand ? "Đất → thử xóa ở line 25." : "Nước → bỏ qua.",
          en: isLand ? "Land → try removing it at line 25." : "Water → skip.",
        },
      });
      if (!isLand) continue;

      work[r][c] = 0;
      snap({
        title: { vi: `line 25: grid[${r}][${c}] = 0 (thử xóa)`, en: `line 25: grid[${r}][${c}] = 0 (trial removal)` },
        removed: [r, c], codeLines: [25], vars: [{ name: "removed cell", value: `(${r},${c})` }],
        note: { vi: `Tạm xóa (${r},${c}) để kiểm tra.`, en: `Temporarily remove (${r},${c}) to test.` },
      });

      const afterCount = countIslands(`Thử xóa (${r},${c}) / Trial removal (${r},${c})`, [r, c]);
      const disconnects = afterCount !== 1;
      snap({
        title: { vi: `line 26: count_islands(grid) != 1 → ${disconnects} (count=${afterCount})`, en: `line 26: count_islands(grid) != 1 → ${disconnects} (count=${afterCount})` },
        removed: [r, c], codeLines: [26],
        vars: [{ name: "count_islands after removal", value: afterCount }, { name: "disconnects?", value: disconnects }],
        note: {
          vi: disconnects
            ? `Xóa (${r},${c}) làm số đảo = ${afterCount} (khác 1) → lưới bị RỜI chỉ với 1 ngày!`
            : `Xóa (${r},${c}) vẫn còn 1 đảo → không đủ, phục hồi ô này (line 29).`,
          en: disconnects
            ? `Removing (${r},${c}) makes island count = ${afterCount} (not 1) → the grid becomes disconnected in just 1 day!`
            : `Removing (${r},${c}) still leaves 1 island → not enough, restore this cell (line 29).`,
        },
      });

      if (disconnects) {
        work[r][c] = 1;
        snap({
          title: { vi: "line 27-28: phục hồi ô rồi return 1", en: "line 27-28: restore cell then return 1" },
          final: true, codeLines: [27, 28],
          vars: [{ name: "answer", value: 1 }],
          note: { vi: `Phục hồi grid[${r}][${c}]=1 (không sửa đổi grid đầu vào), trả về 1.`, en: `Restore grid[${r}][${c}]=1 (don't mutate the input), return 1.` },
        });
        return { original: grid, answer: 1, steps };
      }
      work[r][c] = 1;
      snap({
        title: { vi: `line 29: grid[${r}][${c}] = 1 (phục hồi)`, en: `line 29: grid[${r}][${c}] = 1 (restore)` },
        cur: [r, c], codeLines: [29], vars: [],
        note: { vi: `Không đủ để rời lưới → phục hồi và thử ô tiếp theo.`, en: `Not enough to disconnect → restore and try the next cell.` },
      });
    }
  }

  // ── Line 30 ─────────────────────────────────────────────────────────
  snap({
    title: { vi: "line 30: return 2", en: "line 30: return 2" },
    final: true, codeLines: [30],
    vars: [{ name: "answer", value: 2 }],
    note: {
      vi: "Không ô đơn lẻ nào làm rời lưới được → cần đúng 2 ngày (luôn khả thi: xóa 2 ô liền kề trên 1 đường đi bất kỳ).",
      en: "No single cell removal disconnects the grid → exactly 2 days needed (always achievable: remove any two adjacent cells along a path).",
    },
  });
  return { original: grid, answer: 2, steps };
}

// ─── 749: Contain Virus — full multi-region line-by-line debugger ───────────
// code lines (1-indexed):
//  1  class Solution:
//  2      def containVirus(self, is_infected):
//  3          rows, cols = len(is_infected), len(is_infected[0])
//  4          total_walls = 0
//  5          while True:
//  6              visited = [[False]*cols for _ in range(rows)]
//  7              regions, frontiers, wall_counts = [], [], []
//  8              for r in range(rows):
//  9                  for c in range(cols):
// 10                      if is_infected[r][c]==1 and not visited[r][c]:
// 11                          region, frontier, walls = set(), set(), 0
// 12                          stack = [(r, c)]; visited[r][c] = True
// 13                          while stack:
// 14                              cur_r, cur_c = stack.pop()
// 15                              region.add((cur_r, cur_c))
// 16                              for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
// 17                                  nr, nc = cur_r+dr, cur_c+dc
// 18                                  if 0<=nr<rows and 0<=nc<cols:
// 19                                      if is_infected[nr][nc]==1 and not visited[nr][nc]:
// 20                                          visited[nr][nc]=True; stack.append((nr,nc))
// 21                                      elif is_infected[nr][nc]==0:
// 22                                          frontier.add((nr,nc)); walls+=1
// 23                          regions.append(region); frontiers.append(frontier); wall_counts.append(walls)
// 24              if not regions: break
// 25              max_idx = max(range(len(regions)), key=lambda i: len(frontiers[i]))
// 26              if len(frontiers[max_idx])==0: break
// 27              total_walls += wall_counts[max_idx]
// 28              for i, region in enumerate(regions):
// 29                  if i == max_idx:
// 30                      for (rr,cc) in region: is_infected[rr][cc]=2
// 31                  else:
// 32                      for (rr,cc) in frontiers[i]: is_infected[rr][cc]=1
// 33          return total_walls
function buildSteps749(input) {
  const { valid, grid } = parseBinary(input, false);
  const steps = [];
  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true, codeLines: [3], vars: [{ name: "answer", value: 0 }],
      note: { vi: "Grid phải gồm 0/1. Ví dụ: 0100000 1|0100000 1.", en: "Grid must contain 0/1." },
    });
    return { original: [], answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const work = grid.map((row) => [...row]);
  const callStack = [];
  const stackText = () => (callStack.length ? callStack.join(" → ") : "∅");

  // Cell coloring: 0=uninfected(empty), 1=infected(wall), 2=quarantined(visited)
  function makeCells(cur, visited, regionCells, frontierCells, winnerCells) {
    return work.map((row, r) => row.map((v, c) => {
      const key = `${r},${c}`;
      let cls = v === 2 ? "visited" : v === 1 ? "wall" : "empty";
      if (regionCells && regionCells.has(key)) cls = "current";
      if (frontierCells && frontierCells.has(key)) cls = "queued";
      if (winnerCells && winnerCells.has(key)) cls = "path";
      if (visited && visited[r] && visited[r][c] && v === 1) cls = "wall";
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      return { label: String(v), cls };
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title, arr: [],
      bfsGrid: { rows, cols, cells: makeCells(o.cur || null, o.visited || null, o.regionCells || null, o.frontierCells || null, o.winnerCells || null) },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [
        ...(o.vars || []),
        { name: "call stack", value: stackText() },
      ],
      note: o.note,
    });
  }

  snap({
    title: { vi: "rows, cols = len(is_infected), len(is_infected[0])", en: "rows, cols = len(is_infected), len(is_infected[0])" },
    codeLines: [3],
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi:
        "Mỗi 'ngày' (vòng while): tìm mọi vùng nhiễm (region), với mỗi vùng tính frontier (ô lành kề) và số tường cần xây. " +
        "Chọn vùng có frontier LỚN NHẤT để cách ly (tô 2), các vùng còn lại LAN ra frontier của chúng (tô 1). Lặp tới khi hết vùng hoặc vùng lớn nhất không đe dọa ai.",
      en:
        "Each 'day' (while loop): find every infected region, compute each region's frontier (adjacent uninfected cells) and wall count. " +
        "Quarantine the region with the LARGEST frontier (mark 2), the rest SPREAD into their frontier (mark 1). Repeat until no regions remain or the largest region threatens nobody.",
    },
  });

  let totalWalls = 0;
  snap({
    title: { vi: "total_walls = 0", en: "total_walls = 0" },
    codeLines: [4], vars: [{ name: "total_walls", value: 0 }],
    note: { vi: "Khởi tạo tổng số tường đã xây.", en: "Initialize the total wall count." },
  });

  let day = 0;
  let guard = 0;
  while (guard++ < 30) {
    day += 1;
    snap({
      title: { vi: `Ngày ${day}: while True → line 6-7 khởi tạo`, en: `Day ${day}: while True → line 6-7 setup` },
      codeLines: [5, 6, 7],
      vars: [{ name: "day", value: day }, { name: "total_walls", value: totalWalls }],
      note: { vi: "Reset visited, và 3 danh sách regions/frontiers/wall_counts cho ngày mới.", en: "Reset visited and the 3 lists regions/frontiers/wall_counts for the new day." },
    });

    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const regions = [];
    const frontiers = [];
    const wallCounts = [];

    for (let r = 0; r < rows; r++) {
      snap({
        title: { vi: `line 8: for r in range(rows) → r = ${r}`, en: `line 8: for r in range(rows) → r = ${r}` },
        visited, codeLines: [8], vars: [{ name: "r", value: r }],
        note: { vi: `Quét hàng ${r} tìm ô nhiễm chưa thăm.`, en: `Scan row ${r} for unvisited infected cells.` },
      });
      for (let c = 0; c < cols; c++) {
        snap({
          title: { vi: `line 9: for c in range(cols) → c = ${c}`, en: `line 9: for c in range(cols) → c = ${c}` },
          visited, cur: [r, c], codeLines: [9], vars: [{ name: "c", value: c }],
          note: { vi: `Xét ô (${r},${c}).`, en: `Inspect cell (${r},${c}).` },
        });
        const isNewInfected = work[r][c] === 1 && !visited[r][c];
        snap({
          title: { vi: `line 10: is_infected[${r}][${c}]==1 and not visited → ${isNewInfected}`, en: `line 10: is_infected[${r}][${c}]==1 and not visited → ${isNewInfected}` },
          visited, cur: [r, c], codeLines: [10],
          vars: [{ name: "is_infected[r][c]", value: work[r][c] }, { name: "visited[r][c]", value: visited[r][c] }],
          note: {
            vi: isNewInfected ? "Ô nhiễm chưa thăm → bắt đầu DFS gom vùng mới (line 11-23)." : "Không phải ô nhiễm mới → bỏ qua.",
            en: isNewInfected ? "Unvisited infected cell → start DFS to collect a new region (lines 11-23)." : "Not a new infected cell → skip.",
          },
        });
        if (!isNewInfected) continue;

        // ── DFS to collect one region ─────────────────────────────────
        const region = new Set();
        const frontier = new Set();
        let walls = 0;
        snap({
          title: { vi: "line 11-12: region,frontier,walls = {},{},0; stack=[(r,c)]", en: "line 11-12: region,frontier,walls = {},{},0; stack=[(r,c)]" },
          visited, cur: [r, c], codeLines: [11, 12],
          vars: [{ name: "region", value: "{}" }, { name: "frontier", value: "{}" }, { name: "walls", value: 0 }],
          note: { vi: `Khởi tạo tập vùng, tập biên, và bộ đếm tường cho vùng bắt đầu tại (${r},${c}).`, en: `Initialize the region set, frontier set, and wall counter for the region starting at (${r},${c}).` },
        });
        const stack = [[r, c]];
        visited[r][c] = true;
        callStack.push(`region#${regions.length}`);

        let innerGuard = 0;
        while (stack.length && innerGuard++ < rows * cols * 4) {
          snap({
            title: { vi: `line 13: while stack → True (len=${stack.length})`, en: `line 13: while stack → True (len=${stack.length})` },
            visited, regionCells: new Set([...region].map(([a, b]) => `${a},${b}`)), codeLines: [13],
            vars: [{ name: "stack size", value: stack.length }],
            note: { vi: "Stack còn ô nhiễm cần xử lý.", en: "The stack still has infected cells to process." },
          });
          const [curR, curC] = stack.pop();
          region.add(`${curR},${curC}`);
          snap({
            title: { vi: `line 14-15: pop → (${curR},${curC}); region.add`, en: `line 14-15: pop → (${curR},${curC}); region.add` },
            visited, cur: [curR, curC], regionCells: new Set([...region]), codeLines: [14, 15],
            vars: [{ name: "region size", value: region.size }],
            note: { vi: `Lấy (${curR},${curC}) khỏi stack, thêm vào region.`, en: `Pop (${curR},${curC}) off the stack, add it to region.` },
          });
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = curR + dr;
            const nc = curC + dc;
            snap({
              title: { vi: `line 16-17: dr,dc=(${dr},${dc}) → next=(${nr},${nc})`, en: `line 16-17: dr,dc=(${dr},${dc}) → next=(${nr},${nc})` },
              visited, cur: [curR, curC], regionCells: new Set([...region]), codeLines: [16, 17],
              vars: [{ name: "nr, nc", value: `${nr}, ${nc}` }],
              note: { vi: `Xét hàng xóm (${nr},${nc}).`, en: `Check neighbor (${nr},${nc}).` },
            });
            const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
            snap({
              title: { vi: `line 18: 0<=nr<rows and 0<=nc<cols → ${inBounds}`, en: `line 18: 0<=nr<rows and 0<=nc<cols → ${inBounds}` },
              visited, cur: inBounds ? [nr, nc] : [curR, curC], regionCells: new Set([...region]), codeLines: [18],
              vars: [{ name: "in bounds?", value: inBounds }],
              note: { vi: inBounds ? "Trong lưới → kiểm tra trạng thái ô." : "Ngoài lưới → bỏ qua.", en: inBounds ? "Inside the grid → check the cell's state." : "Outside the grid → skip." },
            });
            if (!inBounds) continue;
            const isNewInfectedNeighbor = work[nr][nc] === 1 && !visited[nr][nc];
            const isUninfected = work[nr][nc] === 0;
            snap({
              title: { vi: `line 19: is_infected[${nr}][${nc}]==1 and not visited → ${isNewInfectedNeighbor}`, en: `line 19: is_infected[${nr}][${nc}]==1 and not visited → ${isNewInfectedNeighbor}` },
              visited, cur: [nr, nc], regionCells: new Set([...region]), codeLines: [19],
              vars: [{ name: "is_infected[nr][nc]", value: work[nr][nc] }, { name: "visited[nr][nc]", value: visited[nr][nc] }],
              note: {
                vi: isNewInfectedNeighbor ? "Đất nhiễm chưa thăm → line 20 thêm vào stack." : isUninfected ? "Ô lành (0) → line 21-22 xét frontier." : "Đã thăm hoặc đã cách ly → bỏ qua.",
                en: isNewInfectedNeighbor ? "Unvisited infected neighbor → line 20 push it." : isUninfected ? "Uninfected cell (0) → lines 21-22 handle the frontier." : "Already visited or quarantined → skip.",
              },
            });
            if (isNewInfectedNeighbor) {
              visited[nr][nc] = true;
              stack.push([nr, nc]);
              snap({
                title: { vi: `line 20: visited[${nr}][${nc}]=True; stack.append((${nr},${nc}))`, en: `line 20: visited[${nr}][${nc}]=True; stack.append((${nr},${nc}))` },
                visited, cur: [nr, nc], regionCells: new Set([...region]), codeLines: [20],
                vars: [{ name: "stack size", value: stack.length }],
                note: { vi: `Đánh dấu (${nr},${nc}) đã thăm, đẩy vào stack để mở rộng vùng.`, en: `Mark (${nr},${nc}) visited, push it to keep growing the region.` },
              });
              continue;
            }
            if (isUninfected) {
              const key = `${nr},${nc}`;
              const isNewFrontier = !frontier.has(key);
              snap({
                title: { vi: `line 21: elif is_infected[${nr}][${nc}]==0 → True`, en: `line 21: elif is_infected[${nr}][${nc}]==0 → True` },
                visited, cur: [nr, nc], regionCells: new Set([...region]), frontierCells: new Set([...frontier]), codeLines: [21],
                vars: [{ name: "already in frontier?", value: !isNewFrontier }],
                note: { vi: "Ô lành kề vùng nhiễm → thêm vào frontier (set tự loại trùng) và cộng walls.", en: "Uninfected cell adjacent to the region → add to frontier (the set dedupes) and increment walls." },
              });
              frontier.add(key);
              walls += 1;
              snap({
                title: { vi: `line 22: frontier.add((${nr},${nc})); walls += 1 → ${walls}`, en: `line 22: frontier.add((${nr},${nc})); walls += 1 → ${walls}` },
                visited, cur: [nr, nc], regionCells: new Set([...region]), frontierCells: new Set([...frontier]), codeLines: [22],
                vars: [{ name: "frontier size", value: frontier.size }, { name: "walls", value: walls }],
                note: {
                  vi: isNewFrontier
                    ? `(${nr},${nc}) là ô frontier MỚI → frontier=${frontier.size}, walls=${walls} (mỗi cạnh nhiễm-lành cần 1 tường, kể cả nếu (${nr},${nc}) đã có trong frontier từ hướng khác — walls KHÔNG dùng set nên vẫn cộng).`
                    : `(${nr},${nc}) ĐÃ có trong frontier (từ ô nhiễm khác) nhưng walls vẫn += 1 vì mỗi CẠNH kề cần 1 tường riêng, dù cùng đích.`,
                  en: isNewFrontier
                    ? `(${nr},${nc}) is a NEW frontier cell → frontier=${frontier.size}, walls=${walls} (every infected-uninfected edge needs its own wall).`
                    : `(${nr},${nc}) was ALREADY in frontier (reached from another infected cell) but walls still += 1, since every adjacent EDGE needs its own wall, even to the same destination cell.`,
                },
              });
            }
          }
        }
        callStack.pop();

        regions.push(region);
        frontiers.push(frontier);
        wallCounts.push(walls);
        snap({
          title: { vi: `line 23: regions.append(...) — vùng #${regions.length - 1}: |region|=${region.size}, |frontier|=${frontier.size}, walls=${walls}`, en: `line 23: regions.append(...) — region #${regions.length - 1}: |region|=${region.size}, |frontier|=${frontier.size}, walls=${walls}` },
          regionCells: new Set([...region]), frontierCells: new Set([...frontier]), codeLines: [23],
          vars: [
            { name: "region #", value: regions.length - 1 },
            { name: "region size", value: region.size },
            { name: "frontier size", value: frontier.size },
            { name: "walls", value: walls },
          ],
          note: {
            vi: `Vùng #${regions.length - 1} hoàn tất: ${region.size} ô nhiễm, đe dọa ${frontier.size} ô lành, cần ${walls} tường.`,
            en: `Region #${regions.length - 1} complete: ${region.size} infected cells, threatens ${frontier.size} uninfected cells, needs ${walls} walls.`,
          },
        });
      }
    }

    // ── Line 24: no regions → break ───────────────────────────────────
    snap({
      title: { vi: `line 24: not regions → ${regions.length === 0}`, en: `line 24: not regions → ${regions.length === 0}` },
      codeLines: [24],
      vars: [{ name: "regions found", value: regions.length }],
      note: {
        vi: regions.length === 0 ? "Không còn vùng nhiễm nào → break (kết thúc)." : `Có ${regions.length} vùng nhiễm → tiếp tục line 25.`,
        en: regions.length === 0 ? "No infected regions left → break (finished)." : `Found ${regions.length} infected region(s) → continue to line 25.`,
      },
    });
    if (regions.length === 0) break;

    // ── Line 25: pick region with max frontier ────────────────────────
    let maxIdx = 0;
    for (let i = 1; i < frontiers.length; i++) {
      if (frontiers[i].size > frontiers[maxIdx].size) maxIdx = i;
    }
    snap({
      title: { vi: `line 25: max_idx = argmax |frontier| → ${maxIdx} (|frontier|=${frontiers[maxIdx].size})`, en: `line 25: max_idx = argmax |frontier| → ${maxIdx} (|frontier|=${frontiers[maxIdx].size})` },
      regionCells: new Set([...regions[maxIdx]]), frontierCells: new Set([...frontiers[maxIdx]]),
      codeLines: [25],
      vars: [
        { name: "frontier sizes", value: `[${frontiers.map((f) => f.size).join(", ")}]` },
        { name: "max_idx", value: maxIdx },
      ],
      note: {
        vi: `So sánh |frontier| của mọi vùng: [${frontiers.map((f) => f.size).join(", ")}]. Vùng #${maxIdx} đe dọa nhiều ô lành nhất → sẽ bị cách ly.`,
        en: `Compare |frontier| across all regions: [${frontiers.map((f) => f.size).join(", ")}]. Region #${maxIdx} threatens the most uninfected cells → it will be quarantined.`,
      },
    });

    // ── Line 26: if the biggest frontier is 0, nothing spreads → break ──
    const noThreat = frontiers[maxIdx].size === 0;
    snap({
      title: { vi: `line 26: len(frontiers[max_idx])==0 → ${noThreat}`, en: `line 26: len(frontiers[max_idx])==0 → ${noThreat}` },
      codeLines: [26],
      vars: [{ name: "frontier[max_idx] size", value: frontiers[maxIdx].size }],
      note: {
        vi: noThreat ? "Vùng lớn nhất cũng không đe dọa ai (bị đóng kín) → break, không xây thêm tường." : "Vùng lớn nhất còn đe dọa ô lành → tiếp tục cách ly.",
        en: noThreat ? "Even the largest region threatens nobody (fully enclosed) → break, no more walls needed." : "The largest region still threatens uninfected cells → proceed to quarantine.",
      },
    });
    if (noThreat) break;

    // ── Line 27: total_walls += wall_counts[max_idx] ──────────────────
    totalWalls += wallCounts[maxIdx];
    snap({
      title: { vi: `line 27: total_walls += ${wallCounts[maxIdx]} → ${totalWalls}`, en: `line 27: total_walls += ${wallCounts[maxIdx]} → ${totalWalls}` },
      regionCells: new Set([...regions[maxIdx]]),
      codeLines: [27],
      vars: [{ name: "wall_counts[max_idx]", value: wallCounts[maxIdx] }, { name: "total_walls", value: totalWalls }],
      note: { vi: `Xây ${wallCounts[maxIdx]} tường quanh vùng #${maxIdx}. total_walls = ${totalWalls}.`, en: `Build ${wallCounts[maxIdx]} walls around region #${maxIdx}. total_walls = ${totalWalls}.` },
    });

    // ── Lines 28-32: apply updates ─────────────────────────────────────
    for (let i = 0; i < regions.length; i++) {
      snap({
        title: { vi: `line 28: for i, region in enumerate(regions) → i = ${i}`, en: `line 28: for i, region in enumerate(regions) → i = ${i}` },
        codeLines: [28], vars: [{ name: "i", value: i }],
        note: { vi: `Xét vùng #${i}.`, en: `Process region #${i}.` },
      });
      const isWinner = i === maxIdx;
      snap({
        title: { vi: `line 29: i == max_idx → ${isWinner}`, en: `line 29: i == max_idx → ${isWinner}` },
        regionCells: new Set([...regions[i]]), codeLines: [29],
        vars: [{ name: "is quarantined region?", value: isWinner }],
        note: {
          vi: isWinner ? `Vùng #${i} bị cách ly → line 30: tô 2 (tường) cho mọi ô trong region.` : `Vùng #${i} không bị cách ly → line 31-32: LAN vào frontier của nó.`,
          en: isWinner ? `Region #${i} is quarantined → line 30: mark 2 (walled) for every cell in the region.` : `Region #${i} is not quarantined → lines 31-32: it SPREADS into its frontier.`,
        },
      });
      if (isWinner) {
        for (const key of regions[i]) {
          const [rr, cc] = key.split(",").map(Number);
          work[rr][cc] = 2;
        }
        snap({
          title: { vi: `line 30: is_infected[rr][cc] = 2 cho toàn vùng #${i}`, en: `line 30: is_infected[rr][cc] = 2 for all of region #${i}` },
          winnerCells: new Set([...regions[i]]), codeLines: [30],
          vars: [{ name: "cells quarantined", value: regions[i].size }],
          note: { vi: `Toàn bộ ${regions[i].size} ô của vùng #${i} chuyển thành 2 (đã xây tường, không lan nữa).`, en: `All ${regions[i].size} cells of region #${i} become 2 (walled, will never spread again).` },
        });
      } else {
        for (const key of frontiers[i]) {
          const [rr, cc] = key.split(",").map(Number);
          work[rr][cc] = 1;
        }
        snap({
          title: { vi: `line 31-32: is_infected[rr][cc] = 1 cho frontier vùng #${i}`, en: `line 31-32: is_infected[rr][cc] = 1 for region #${i}'s frontier` },
          frontierCells: new Set([...frontiers[i]]), codeLines: [31, 32],
          vars: [{ name: "cells newly infected", value: frontiers[i].size }],
          note: { vi: `Vùng #${i} lan sang ${frontiers[i].size} ô lành kề, các ô đó chuyển từ 0 → 1.`, en: `Region #${i} spreads into ${frontiers[i].size} adjacent uninfected cells, which flip from 0 → 1.` },
        });
      }
    }
  }

  snap({
    title: { vi: `line 33: return total_walls = ${totalWalls}`, en: `line 33: return total_walls = ${totalWalls}` },
    final: true, codeLines: [33],
    vars: [{ name: "answer", value: totalWalls }],
    note: {
      vi: `Không còn vùng nào cần cách ly hoặc lan. Tổng số tường đã xây = ${totalWalls}.`,
      en: `No more regions to quarantine or spread. Total walls built = ${totalWalls}.`,
    },
  });

  return { original: grid, answer: totalWalls, steps };
}

const problems = {
  749: {
    id: 749, difficulty: "hard", slug: "contain-virus",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Contain Virus", "Contain Virus"),
    titleVi: tr("Ngăn chặn virus (chọn vùng đe dọa nhiều nhất mỗi ngày)", "Contain virus (quarantine the most-threatening region daily)"),
    statement: tr(
      "Mỗi ngày: tìm mọi vùng nhiễm, xây tường quanh vùng đe dọa NHIỀU ô lành nhất (dừng lan mãi), các vùng còn lại LAN sang ô lành kề. Lặp tới khi hết vùng hoặc vùng lớn nhất không đe dọa ai. Trả về tổng số tường. Nhập grid: hàng cách '|'.",
      "Each day: find every infected region, wall off the region threatening the MOST uninfected cells (stops it spreading forever), the rest SPREAD into their adjacent uninfected cells. Repeat until no regions remain or the largest region threatens nobody. Return the total walls used. Enter grid: rows separated by '|'."
    ),
    defaultInput: "01000001|01000001|00000001|00000000",
    inputKind: "string",
    inputLabel: tr("Grid 0/1 (0=lành,1=nhiễm, hàng cách '|')", "0/1 grid (0=uninfected,1=infected, rows separated by '|')"),
    approach: [
      tr("Mỗi ngày, DFS gom từng vùng nhiễm liên thông, tính frontier (ô lành kề) và số tường cần cho vùng đó.", "Each day, DFS collects each connected infected region, computing its frontier (adjacent uninfected cells) and wall count."),
      tr("Chọn vùng có |frontier| LỚN NHẤT để cách ly vĩnh viễn (tô 2 = tường).", "Pick the region with the LARGEST |frontier| to permanently quarantine (mark 2 = walled)."),
      tr("Các vùng còn lại LAN vào frontier của chúng (tô 1 = nhiễm mới).", "The remaining regions SPREAD into their frontier (mark 1 = newly infected)."),
      tr("Dừng khi không còn vùng nào, hoặc vùng lớn nhất cũng không đe dọa ai (frontier rỗng).", "Stop when no regions remain, or even the largest region threatens nobody (empty frontier)."),
    ],
    complexity: {
      time: "O(days · rows · cols)",
      space: "O(rows · cols)",
      note: tr("Mỗi ngày quét toàn lưới O(rows·cols); số ngày bị chặn bởi kích thước lưới.", "Each day scans the whole grid O(rows·cols); the number of days is bounded by the grid size."),
    },
    code: [
      "class Solution:",
      "    def containVirus(self, is_infected):",
      "        rows, cols = len(is_infected), len(is_infected[0])",
      "        total_walls = 0",
      "        while True:",
      "            visited = [[False]*cols for _ in range(rows)]",
      "            regions, frontiers, wall_counts = [], [], []",
      "            for r in range(rows):",
      "                for c in range(cols):",
      "                    if is_infected[r][c]==1 and not visited[r][c]:",
      "                        region, frontier, walls = set(), set(), 0",
      "                        stack = [(r, c)]; visited[r][c] = True",
      "                        while stack:",
      "                            cur_r, cur_c = stack.pop()",
      "                            region.add((cur_r, cur_c))",
      "                            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:",
      "                                nr, nc = cur_r+dr, cur_c+dc",
      "                                if 0<=nr<rows and 0<=nc<cols:",
      "                                    if is_infected[nr][nc]==1 and not visited[nr][nc]:",
      "                                        visited[nr][nc]=True; stack.append((nr,nc))",
      "                                    elif is_infected[nr][nc]==0:",
      "                                        frontier.add((nr,nc)); walls+=1",
      "                        regions.append(region); frontiers.append(frontier); wall_counts.append(walls)",
      "            if not regions: break",
      "            max_idx = max(range(len(regions)), key=lambda i: len(frontiers[i]))",
      "            if len(frontiers[max_idx])==0: break",
      "            total_walls += wall_counts[max_idx]",
      "            for i, region in enumerate(regions):",
      "                if i == max_idx:",
      "                    for (rr,cc) in region: is_infected[rr][cc]=2",
      "                else:",
      "                    for (rr,cc) in frontiers[i]: is_infected[rr][cc]=1",
      "        return total_walls",
    ],
    builder: buildSteps749,
  },
  1568: {
    id: 1568, difficulty: "hard", slug: "minimum-number-of-days-to-disconnect-island",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Minimum Number of Days to Disconnect Island", "Minimum Number of Days to Disconnect Island"),
    titleVi: tr("Số ngày tối thiểu để tách đảo (đáp án chỉ 0/1/2)", "Minimum days to disconnect the island (answer is only 0/1/2)"),
    statement: tr(
      "Mỗi ngày xóa 1 ô đất. Trả về số ngày tối thiểu để lưới bị rời (0 hoặc ≥2 đảo, hoặc rỗng). Nhập grid: hàng cách '|'.",
      "Each day you may remove one land cell. Return the minimum number of days until the grid becomes disconnected (0 or ≥2 islands, or empty). Enter grid: rows separated by '|'."
    ),
    defaultInput: "0110|0110|0000",
    inputKind: "string",
    inputLabel: tr("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    approach: [
      tr("Chìa khóa: đáp án chỉ có thể là 0, 1, hoặc 2 — không cần thử nhiều hơn.", "Key insight: the answer can only be 0, 1, or 2 — never more."),
      tr("count_islands(grid): DFS/BFS đếm số thành phần liên thông của đất.", "count_islands(grid): DFS/BFS to count connected land components."),
      tr("Nếu số đảo ban đầu ≠ 1 → đã rời sẵn → 0.", "If the initial island count ≠ 1 → already disconnected → 0."),
      tr("Thử xóa từng ô đất; nếu sau khi xóa số đảo ≠ 1 → 1 ngày là đủ.", "Try removing each land cell; if the count becomes ≠ 1 afterward → 1 day is enough."),
      tr("Không ô đơn lẻ nào đủ → 2 (luôn khả thi bằng cách xóa 2 ô liền kề).", "No single cell suffices → 2 (always achievable by removing two adjacent cells)."),
    ],
    complexity: {
      time: "O((rows·cols)²)",
      space: "O(rows·cols)",
      note: tr("Thử xóa mỗi ô đất rồi đếm lại đảo O(rows·cols) → tổng O((rows·cols)²).", "Trying each land cell then recounting islands is O(rows·cols) → overall O((rows·cols)²)."),
    },
    code: [
      "class Solution:",
      "    def minDays(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        def count_islands(g):",
      "            visited = [[False]*cols for _ in range(rows)]",
      "            def dfs(r, c):",
      "                stack = [(r, c)]; visited[r][c] = True",
      "                while stack:",
      "                    cr, cc = stack.pop()",
      "                    for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:",
      "                        nr, nc = cr+dr, cc+dc",
      "                        if 0<=nr<rows and 0<=nc<cols and g[nr][nc]==1 and not visited[nr][nc]:",
      "                            visited[nr][nc] = True; stack.append((nr,nc))",
      "            count = 0",
      "            for r in range(rows):",
      "                for c in range(cols):",
      "                    if g[r][c]==1 and not visited[r][c]:",
      "                        count += 1; dfs(r, c)",
      "            return count",
      "        if count_islands(grid) != 1:",
      "            return 0",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if grid[r][c] == 1:",
      "                    grid[r][c] = 0",
      "                    if count_islands(grid) != 1:",
      "                        grid[r][c] = 1",
      "                        return 1",
      "                    grid[r][c] = 1",
      "        return 2",
    ],
    builder: buildSteps1568,
  },
  1254: {
    id: 1254, difficulty: "medium", slug: "number-of-closed-islands",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Number of Closed Islands", "Number of Closed Islands"),
    titleVi: tr("Số đảo bị nước bao quanh hoàn toàn (closed)", "Count islands fully surrounded by water"),
    statement: tr(
      "Grid gồm 0 (đất) và 1 (nước). Đảo 'closed' là nhóm đất liên thông 4 hướng KHÔNG chạm biên grid. Đếm số đảo closed. Nhập grid: hàng cách '|'.",
      "Grid of 0 (land) and 1 (water). A 'closed' island is a 4-connected land group that does NOT touch the grid border. Count closed islands. Enter grid: rows separated by '|'."
    ),
    defaultInput: "11111110|10000110|10101110|10000101|11111110",
    inputKind: "string",
    inputLabel: tr("Grid 0/1 (0=đất,1=nước, hàng cách '|')", "0/1 grid (0=land,1=water, rows separated by '|')"),
    approach: [
      tr("Đất chạm biên KHÔNG thể là closed → nhấn chìm (flood) hết đất chạm biên trước bằng DFS.", "Border-touching land can NEVER be closed → flood away all border-touching land first with DFS."),
      tr("Sau khi loại biên, đất còn lại chắc chắn không chạm biên.", "After removing the border, any remaining land is guaranteed not to touch the border."),
      tr("Quét phần bên trong: mỗi lần gặp đất còn lại → 1 đảo closed mới, DFS nhấn chìm nó rồi count += 1.", "Scan the interior: each remaining land cell found → one new closed island, DFS floods it then count += 1."),
    ],
    complexity: {
      time: "O(rows·cols)",
      space: "O(rows·cols)",
      note: tr("Mỗi ô được thăm tối đa một lần qua đệ quy DFS.", "Each cell is visited at most once via recursive DFS."),
    },
    code: [
      "class Solution:",
      "    def closedIsland(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        def dfs(r, c):",
      "            if r < 0 or r >= rows or c < 0 or c >= cols:",
      "                return",
      "            if grid[r][c] != 0:",
      "                return",
      "            grid[r][c] = 1",
      "            dfs(r + 1, c)",
      "            dfs(r - 1, c)",
      "            dfs(r, c + 1)",
      "            dfs(r, c - 1)",
      "        for r in range(rows):",
      "            dfs(r, 0)",
      "            dfs(r, cols - 1)",
      "        for c in range(cols):",
      "            dfs(0, c)",
      "            dfs(rows - 1, c)",
      "        count = 0",
      "        for r in range(1, rows - 1):",
      "            for c in range(1, cols - 1):",
      "                if grid[r][c] == 0:",
      "                    dfs(r, c)",
      "                    count += 1",
      "        return count",
    ],
    builder: buildSteps1254,
  },
  463: {
    id: 463, difficulty: "easy", slug: "island-perimeter",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Island Perimeter", "Island Perimeter"),
    titleVi: tr("Chu vi đảo (đếm cạnh biên)", "Island perimeter (count boundary edges)"),
    statement: tr(
      "Lưới chỉ có một đảo (không hồ bên trong). Trả về chu vi của đảo. Nhập grid: hàng cách '|'.",
      "The grid contains exactly one island (no lakes). Return the island's perimeter. Enter grid: rows separated by '|'."
    ),
    defaultInput: "0100|1110|0100|1100",
    inputKind: "string",
    inputLabel: tr("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    extraParams: [
      {
        key: "approach",
        label: tr("Cách giải", "Approach"),
        type: "select",
        default: "1",
        options: [
          { value: "1", label: tr("Cách 1: đếm 4 hướng trực tiếp", "Approach 1: check all 4 sides directly") },
          { value: "2", label: tr("Cách 2: +4 rồi trừ cạnh dính trái/trên", "Approach 2: +4 then subtract shared left/top edges") },
        ],
      },
    ],
    approach: [
      tr("Cách 1: với mỗi ô đất, xét 4 hướng: nếu hướng đó là nước hoặc ngoài lưới → +1 chu vi.", "Approach 1: for each land cell, check 4 directions: if that side is water or out of bounds → +1 perimeter."),
      tr("Cách 2: mỗi ô đất giả sử có 4 cạnh tự do (+4), rồi trừ 2 cho mỗi ô đất kề TRÁI hoặc TRÊN (mỗi cặp chỉ trừ 1 lần, không đếm 2 lần vì chỉ nhìn về 1 phía).", "Approach 2: assume every land cell has 4 free edges (+4), then subtract 2 for every LEFT or TOP land neighbor (each pair subtracted exactly once by only looking backward)."),
    ],
    complexity: {
      time: "O(rows·cols)",
      space: "O(1)",
      note: tr("Mỗi ô xét đúng 1 lần; cách 2 chỉ xét 2 hướng (trái, trên) thay vì 4.", "Each cell is checked once; approach 2 only checks 2 directions (left, top) instead of 4."),
    },
    codeLabel: tr("Cách 1: đếm 4 hướng trực tiếp", "Approach 1: check all 4 sides directly"),
    code: [
      "class Solution:",
      "    def islandPerimeter(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        perimeter = 0",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if grid[r][c] != 1:",
      "                    continue",
      "                for delta_r, delta_c in [(1,0),(-1,0),(0,1),(0,-1)]:",
      "                    next_r, next_c = r + delta_r, c + delta_c",
      "                    out_of_bounds = (next_r < 0 or next_r >= rows or",
      "                                      next_c < 0 or next_c >= cols)",
      "                    if out_of_bounds or grid[next_r][next_c] == 0:",
      "                        perimeter += 1",
      "        return perimeter",
    ],
    code2Label: tr("Cách 2: +4 rồi trừ cạnh dính trái/trên", "Approach 2: +4 then subtract shared left/top edges"),
    code2: [
      "class Solution:",
      "    def islandPerimeter(self, grid):",
      "        n_rows = len(grid)",
      "        n_cols = len(grid[0])",
      "        total = 0",
      "        for i in range(n_rows):",
      "            for j in range(n_cols):",
      "                if grid[i][j] == 1:",
      "                    total += 4",
      "                    if j > 0 and grid[i][j-1] == 1:",
      "                        total -= 2",
      "                    if i > 0 and grid[i-1][j] == 1:",
      "                        total -= 2",
      "        return total",
    ],
    builder: buildSteps463,
    builder2: buildSteps463v2,
  },
  733: {
    id: 733, difficulty: "easy", slug: "flood-fill",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Flood Fill", "Flood Fill"), titleVi: tr("Tô màu một vùng liên thông", "Recolor a connected region"),
    statement: tr("Bắt đầu tại (start_row, start_col), đổi màu toàn bộ vùng 4 hướng có cùng màu ban đầu thành color.", "Starting at (start_row, start_col), recolor the entire 4-connected region sharing its original color."),
    defaultInput: "1,1,1|1,1,0|1,0,1", inputKind: "string",
    inputLabel: tr("Image (hàng cách '|')", "Image (rows separated by '|')"),
    extraParams: [
      {
        key: "approach", label: tr("Cách giải", "Approach"), type: "select", default: "1",
        options: [
          { value: "1", label: tr("Cách 1: DFS stack", "Approach 1: DFS stack") },
          { value: "2", label: tr("Cách 2: DFS đệ quy", "Approach 2: recursive DFS") },
          { value: "3", label: tr("Cách 3: BFS queue", "Approach 3: BFS queue") },
        ],
      },
      { key: "start_row", label: tr("start_row", "start_row"), default: 1 },
      { key: "start_col", label: tr("start_col", "start_col"), default: 1 },
      { key: "color", label: tr("color mới", "new color"), default: 2 },
    ],
    approach: [tr("Cả ba cách đều lưu màu ban đầu và tô ô ngay khi phát hiện để tránh thêm trùng.", "All three approaches store the source color and recolor on discovery to avoid duplicates."),tr("Cách 1 và 2 dùng DFS: stack tự tạo hoặc recursive call stack.", "Approaches 1 and 2 use DFS through an explicit stack or the recursive call stack."),tr("Cách 3 dùng BFS queue: popleft ở FRONT, append vào BACK nên vùng lan theo từng lớp.", "Approach 3 uses a BFS queue: popleft from FRONT and append at BACK, so the region spreads layer by layer.")],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô hợp lệ được tô một lần; bộ nhớ là DFS stack, call stack hoặc BFS queue.", "Each valid cell is recolored once; memory is the DFS stack, call stack, or BFS queue.") },
    codeLabel: tr("Cách 1: DFS stack", "Approach 1: DFS stack"),
    code2Label: tr("Cách 2: DFS đệ quy", "Approach 2: recursive DFS"),
    code3Label: tr("Cách 3: BFS queue", "Approach 3: BFS queue"),
    code: [
      "from typing import List", "", "class Solution:",
      "    def floodFill(self, image: List[List[int]], start_row: int, start_col: int, color: int) -> List[List[int]]:",
      "        rows, cols = len(image), len(image[0])",
      "        original_color = image[start_row][start_col]",
      "        if original_color == color: return image",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        stack = [(start_row, start_col)]",
      "        image[start_row][start_col] = color",
      "        while stack:",
      "            row, col = stack.pop()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if 0 <= next_row < rows and 0 <= next_col < cols and image[next_row][next_col] == original_color:",
      "                    image[next_row][next_col] = color",
      "                    stack.append((next_row, next_col))",
      "        return image",
    ],
    code2: [
      "class Solution:",
      "    def floodFill(self, image, sr, sc, color):",
      "        rows = len(image)",
      "        cols = len(image[0])",
      "",
      "        original_color = image[sr][sc]",
      "",
      "        if original_color == color:",
      "            return image",
      "",
      "        def dfs(row, col):",
      "            if row < 0 or row >= rows or col < 0 or col >= cols:",
      "                return",
      "",
      "            if image[row][col] != original_color:",
      "                return",
      "",
      "            image[row][col] = color",
      "",
      "            dfs(row + 1, col)",
      "            dfs(row - 1, col)",
      "            dfs(row, col + 1)",
      "            dfs(row, col - 1)",
      "",
      "        dfs(sr, sc)",
      "",
      "        return image",
    ],
    code3: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def floodFill(self, image, sr, sc, color):",
      "        rows, cols = len(image), len(image[0])",
      "        original_color = image[sr][sc]",
      "",
      "        if original_color == color:",
      "            return image",
      "",
      "        queue = deque([(sr, sc)])",
      "        image[sr][sc] = color",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "",
      "        while queue:",
      "            row, col = queue.popleft()",
      "",
      "            for delta_row, delta_col in directions:",
      "                next_row = row + delta_row",
      "                next_col = col + delta_col",
      "",
      "                row_inside = 0 <= next_row < rows",
      "                col_inside = 0 <= next_col < cols",
      "",
      "                if not row_inside or not col_inside:",
      "                    continue",
      "",
      "                if image[next_row][next_col] != original_color:",
      "                    continue",
      "",
      "                image[next_row][next_col] = color",
      "                queue.append((next_row, next_col))",
      "",
      "        return image",
    ],
    liveArgs: (input, params = {}) => {
      const parsed = parseNumbers(input);
      return [parsed.grid, Number(params.start_row ?? 1), Number(params.start_col ?? 1), Number(params.color ?? 2)];
    },
    builder: (input, params) => {
      const approach = Number(params && params.approach);
      if (approach === 3) return buildSteps733Bfs(input, params);
      if (approach === 2) return buildSteps733Recursive(input, params);
      return buildSteps733(input, params);
    },
  },
  200: {
    id: 200, difficulty: "medium", slug: "number-of-islands",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" }, tags: [floodFillTag],
    title: tr("Number of Islands", "Number of Islands"), titleVi: tr("Đếm số đảo bằng flood fill", "Count islands with flood fill"),
    statement: tr("Đếm số component đất '1' nối nhau theo bốn hướng trong grid.", "Count four-directionally connected components of land '1' in the grid."),
    defaultInput: "11000|11000|00100|00011", inputKind: "string", inputLabel: tr("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    approach: [tr("Quét grid; mỗi ô đất chưa thăm bắt đầu một đảo mới.", "Scan the grid; each unvisited land cell starts a new island."),tr("Đổi đất thành nước ngay khi phát hiện để đánh dấu visited.", "Turn land into water immediately when discovered to mark it visited."),tr("Flood fill toàn bộ đảo trước khi tiếp tục scan.", "Flood-fill the entire island before continuing the scan.")],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô đất vào stack tối đa một lần.", "Each land cell enters the stack at most once.") },
    code: [
      "from typing import List", "", "class Solution:",
      "    def numIslands(self, grid: List[List[str]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        islands = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] != '1': continue",
      "                islands += 1",
      "                stack = [(row, col)]",
      "                grid[row][col] = '0'",
      "                while stack:",
      "                    current_row, current_col = stack.pop()",
      "                    for delta_row, delta_col in directions:",
      "                        next_row, next_col = current_row + delta_row, current_col + delta_col",
      "                        if 0 <= next_row < rows and 0 <= next_col < cols and grid[next_row][next_col] == '1':",
      "                            grid[next_row][next_col] = '0'",
      "                            stack.append((next_row, next_col))",
      "        return islands",
    ], builder: buildSteps200Detailed,
  },
  695: {
    id: 695, difficulty: "medium", slug: "max-area-of-island",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Max Area of Island", "Max Area of Island"), titleVi: tr("Diện tích đảo lớn nhất", "Largest island area"),
    statement: tr("Trả về số ô đất trong đảo 4 hướng lớn nhất, hoặc 0 nếu không có đất.", "Return the number of land cells in the largest 4-connected island, or 0 if there is no land."),
    defaultInput: "00100|01110|00100|00011", inputKind: "string", inputLabel: tr("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
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
    approach: [tr("Cách 1 (BFS): dùng stack lặp. Mỗi ô đất pop ra → area++.", "Approach 1 (BFS): iterative stack. Each land cell popped → area++."),tr("Cách 2 (DFS đệ quy): dfs(r,c) return 0 nếu out-of-bounds hoặc nước, else ghi đè 0 và return 1 + dfs 4 hướng.", "Approach 2 (recursive DFS): dfs(r,c) returns 0 if OOB/water, else overwrites cell to 0 and returns 1 + dfs in 4 dirs.")],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô đất được xử lý tối đa một lần.", "Each land cell is processed at most once.") },
    codeLabel: { vi: "Cách 1: BFS (iterative stack)", en: "Approach 1: BFS (iterative stack)" },
    code: [
      "from typing import List", "", "class Solution:",
      "    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        max_area = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] != 1: continue",
      "                stack = [(row, col)]",
      "                grid[row][col] = 0",
      "                area = 0",
      "                while stack:",
      "                    current_row, current_col = stack.pop()",
      "                    area += 1",
      "                    for delta_row, delta_col in directions:",
      "                        next_row, next_col = current_row + delta_row, current_col + delta_col",
      "                        if 0 <= next_row < rows and 0 <= next_col < cols and grid[next_row][next_col] == 1:",
      "                            grid[next_row][next_col] = 0",
      "                            stack.append((next_row, next_col))",
      "                max_area = max(max_area, area)",
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
    builder: buildSteps695Detailed,
    builder2: buildSteps695v2,
  },
  1905: {
    id: 1905, difficulty: "medium", slug: "count-sub-islands",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Count Sub Islands", "Count Sub Islands"), titleVi: tr("Đếm đảo con của grid1", "Count grid2 islands contained in grid1"),
    statement: tr("Đếm các đảo trong grid2 mà mọi ô đất đều nằm trên ô đất của grid1. Nhập grid1;grid2.", "Count grid2 islands whose every land cell lies on grid1 land. Enter grid1;grid2."),
    defaultInput: "1,1,1,0,0|0,1,1,1,1|0,0,0,0,0|1,0,0,0,0|1,1,0,1,1;1,1,1,0,0|0,0,1,1,1|0,1,0,0,0|1,0,1,1,0|0,1,0,1,0",
    inputKind: "string", inputLabel: tr("grid1;grid2 (hàng cách '|')", "grid1;grid2 (rows separated by '|')"),
    extraParams: [
      {
        key: "approach",
        label: tr("Cách giải", "Approach"),
        type: "select",
        default: "1",
        options: [
          { value: "1", label: tr("Cách 1: DFS lặp (stack)", "Approach 1: Iterative DFS (stack)") },
          { value: "2", label: tr("Cách 2: DFS đệ quy trả về boolean", "Approach 2: Recursive DFS returning a boolean") },
        ],
      },
    ],
    approach: [
      tr("Cách 1 (stack): flood fill từng đảo chưa thăm trong grid2. is_sub bắt đầu True và thành False nếu gặp ô ngoài grid1.", "Approach 1 (stack): flood-fill each unvisited island in grid2. is_sub starts True and becomes False if any cell lies over grid1 water."),
      tr("Cách 2 (đệ quy): dfs(row,col) trả về BOOLEAN. Ô ngoài biên/nước trả True (vacuously true). Kết quả = is_sub_island AND cả 4 hướng.", "Approach 2 (recursive): dfs(row,col) returns a BOOLEAN. Out-of-bounds/water cells return True (vacuously true). Result = is_sub_island AND all 4 directions."),
    ],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô grid2 được xử lý tối đa một lần; cách 2 dùng call stack đệ quy thay cho stack thủ công.", "Each grid2 cell is processed at most once; approach 2 uses the recursive call stack instead of a manual stack.") },
    codeLabel: tr("Cách 1: DFS lặp (stack)", "Approach 1: Iterative DFS (stack)"),
    code: [
      "from typing import List", "", "class Solution:",
      "    def countSubIslands(self, grid1: List[List[int]], grid2: List[List[int]]) -> int:",
      "        rows, cols = len(grid1), len(grid1[0])",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        count = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid2[row][col] != 1: continue",
      "                stack = [(row, col)]",
      "                grid2[row][col] = 0",
      "                is_sub = True",
      "                while stack:",
      "                    current_row, current_col = stack.pop()",
      "                    if grid1[current_row][current_col] == 0: is_sub = False",
      "                    for delta_row, delta_col in directions:",
      "                        next_row, next_col = current_row + delta_row, current_col + delta_col",
      "                        if 0 <= next_row < rows and 0 <= next_col < cols and grid2[next_row][next_col] == 1:",
      "                            grid2[next_row][next_col] = 0",
      "                            stack.append((next_row, next_col))",
      "                if is_sub:",
      "                    count += 1",
      "        return count",
    ],
    code2Label: tr("Cách 2: DFS đệ quy trả về boolean", "Approach 2: Recursive DFS returning a boolean"),
    code2: [
      "class Solution:",
      "    def countSubIslands(self, grid1, grid2):",
      "        rows = len(grid2)",
      "        cols = len(grid2[0])",
      "        def dfs(row, col):",
      "            if (row < 0 or row >= rows or",
      "                    col < 0 or col >= cols or",
      "                    grid2[row][col] == 0):",
      "                return True",
      "            is_sub_island = grid1[row][col] == 1",
      "            grid2[row][col] = 0",
      "            up = dfs(row - 1, col)",
      "            down = dfs(row + 1, col)",
      "            left = dfs(row, col - 1)",
      "            right = dfs(row, col + 1)",
      "            return (is_sub_island and up and down and left and right)",
      "        result = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid2[row][col] == 1:",
      "                    if dfs(row, col):",
      "                        result += 1",
      "        return result",
    ],
    builder: buildSteps1905,
    builder2: buildSteps1905v2,
  },
};

// ─── 695 Approach 2: Recursive DFS — detailed line-by-line debugger ───────────
// code2 lines (1-indexed):
//  1  class Solution:
//  2      def maxAreaOfIsland(self, grid):
//  3          m, n = len(grid), len(grid[0])
//  4          max_area = 0
//  5          def dfs(r, c):
//  6              if r < 0 or r == m or c < 0 or c == n:
//  7                  return 0
//  8              if grid[r][c] == 0:
//  9                  return 0
// 10              grid[r][c] = 0
// 11              return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1)
// 12          for r in range(m):
// 13              for c in range(n):
// 14                  if grid[r][c] == 1:
// 15                      area = dfs(r, c)
// 16                      max_area = max(max_area, area)
// 17          return max_area
function buildSteps695v2(input) {
  const { valid, grid } = parseBinary(input, true);
  const steps = [];
  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], codeBlock: 2,
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Grid phải gồm 0/1. Ví dụ: 00100|01110|00100|00011.", en: "Grid must contain 0/1. Example: 00100|01110|00100|00011." },
    });
    return { original: [], answer: 0, steps };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const work = grid.map((row) => row.map((v) => Number(v)));
  const consumed = Array.from({ length: rows }, () => Array(cols).fill(false));
  const islandId = Array.from({ length: rows }, () => Array(cols).fill(0));
  const key = (r, c) => `${r},${c}`;

  // Call stack of "dfs(r,c)" frames for the debug panel.
  const callStack = [];
  const stackText = () => (callStack.length ? callStack.join(" → ") : "∅");

  let maxArea = 0;
  let island = 0;
  let bestCells = new Set();
  let curIsland = [];
  let scanR = null;
  let scanC = null;

  // label = LIVE value of grid[r][c] so the viewer literally sees 1 → 0
  // happen when the code executes `grid[r][c] = 0` (line 10).
  // meta  = which island absorbed the cell, kept as a small sub-label.
  function makeCells(cur, bestSet) {
    return grid.map((row, r) => row.map((origCell, c) => {
      const live = String(work[r][c]);
      let cls = origCell === "0" ? "wall" : "empty";
      let meta = "";
      if (consumed[r][c]) {
        cls = "visited";
        meta = `#${islandId[r][c]}`;
      }
      if (bestSet && bestSet.has(key(r, c))) cls = "path";
      if (cur && cur[0] === r && cur[1] === c) cls = "current";
      return { label: live, meta, cls };
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title,
      arr: [],
      codeBlock: 2,
      bfsGrid: { rows, cols, cells: makeCells(o.cur || null, o.best || bestCells) },
      highlight: [], mark: [],
      final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [
        ...(o.vars || []),
        { name: "call stack", value: stackText() },
        { name: "depth", value: callStack.length },
        { name: "max_area", value: maxArea },
      ],
      note: o.note,
    });
  }

  // ── Line 3 ──────────────────────────────────────────────────────────
  snap({
    title: { vi: "m, n = len(grid), len(grid[0])", en: "m, n = len(grid), len(grid[0])" },
    codeLines: [3],
    vars: [{ name: "m", value: rows }, { name: "n", value: cols }],
    note: { vi: `Lưới ${rows} dòng × ${cols} cột.`, en: `Grid has ${rows} rows × ${cols} cols.` },
  });

  // ── Line 4 ──────────────────────────────────────────────────────────
  snap({
    title: { vi: "max_area = 0", en: "max_area = 0" },
    codeLines: [4],
    vars: [{ name: "grid (live)", value: work.map((row) => row.join("")).join(" | ") }],
    note: {
      vi:
        "DFS đệ quy: mỗi lần gặp đất, ghi đè grid[r][c]=0 để không đếm lại, rồi cộng kết quả 4 hướng.\n" +
        "Số lớn trong mỗi ô là GIÁ TRỊ THẬT của grid[r][c] — bạn sẽ thấy nó đổi 1 → 0 ngay khi code chạy line 10. " +
        "Nhãn nhỏ #N cho biết ô đó bị hút vào đảo số mấy.",
      en:
        "Recursive DFS: on land, overwrite grid[r][c]=0 so it is not recounted, then sum the 4 directions.\n" +
        "The big number in each cell is the LIVE value of grid[r][c] — you will watch it flip 1 → 0 the moment line 10 runs. " +
        "The small #N tag shows which island absorbed that cell.",
    },
  });

  const DIRS = [
    { dr: 1, dc: 0, label: "dfs(r+1, c)" },
    { dr: -1, dc: 0, label: "dfs(r-1, c)" },
    { dr: 0, dc: 1, label: "dfs(r, c+1)" },
    { dr: 0, dc: -1, label: "dfs(r, c-1)" },
  ];

  function dfs(r, c) {
    callStack.push(`dfs(${r},${c})`);

    // ── Line 6: boundary guard ───────────────────────────────────────
    const oob = r < 0 || r === rows || c < 0 || c === cols;
    snap({
      title: { vi: `dfs(${r},${c}) — line 6: kiểm tra biên`, en: `dfs(${r},${c}) — line 6: boundary check` },
      cur: oob ? null : [r, c],
      codeLines: [6],
      vars: [
        { name: "r, c", value: `${r}, ${c}` },
        { name: "r < 0 or r == m", value: `${r} < 0 or ${r} == ${rows} → ${r < 0 || r === rows}` },
        { name: "c < 0 or c == n", value: `${c} < 0 or ${c} == ${cols} → ${c < 0 || c === cols}` },
        { name: "out of bounds?", value: oob },
      ],
      note: {
        vi: oob ? `(${r},${c}) nằm NGOÀI lưới → đi vào line 7.` : `(${r},${c}) nằm trong lưới → bỏ qua line 7, sang line 8.`,
        en: oob ? `(${r},${c}) is OUTSIDE the grid → go to line 7.` : `(${r},${c}) is inside → skip line 7, go to line 8.`,
      },
    });
    if (oob) {
      // ── Line 7 ────────────────────────────────────────────────────
      snap({
        title: { vi: `line 7: return 0 (ngoài biên)`, en: `line 7: return 0 (out of bounds)` },
        codeLines: [7],
        vars: [{ name: "returns", value: 0 }],
        note: { vi: `Ô ngoài lưới không đóng góp diện tích. Quay về frame gọi.`, en: `Out-of-bounds contributes no area. Return to caller frame.` },
      });
      callStack.pop();
      return 0;
    }

    // ── Line 8: water / already visited ──────────────────────────────
    const water = work[r][c] === 0;
    snap({
      title: { vi: `dfs(${r},${c}) — line 8: grid[r][c] == 0?`, en: `dfs(${r},${c}) — line 8: grid[r][c] == 0?` },
      cur: [r, c],
      codeLines: [8],
      vars: [
        { name: "r, c", value: `${r}, ${c}` },
        { name: "grid[r][c] (live)", value: work[r][c] },
        { name: "grid gốc", value: grid[r][c] },
        { name: "đã bị ghi đè?", value: consumed[r][c] },
        { name: "is water/visited?", value: water },
      ],
      note: {
        vi: water
          ? (consumed[r][c]
              ? `grid[${r}][${c}] = 0 vì ô này ĐÃ THĂM (gốc là 1, bị line 10 ghi thành 0) → line 9 trả 0, chống đếm trùng.`
              : `grid[${r}][${c}] = 0 vì đây là NƯỚC ngay từ đầu → line 9 trả 0.`)
          : `grid[${r}][${c}] = 1 → đất CHƯA thăm → sang line 10 để ghi đè thành 0.`,
        en: water
          ? (consumed[r][c]
              ? `grid[${r}][${c}] = 0 because this cell was ALREADY VISITED (originally 1, set to 0 by line 10) → line 9 returns 0, preventing a recount.`
              : `grid[${r}][${c}] = 0 because it is WATER from the start → line 9 returns 0.`)
          : `grid[${r}][${c}] = 1 → UNVISITED land → go to line 10 to overwrite it to 0.`,
      },
    });
    if (water) {
      // ── Line 9 ────────────────────────────────────────────────────
      snap({
        title: { vi: `line 9: return 0 (nước / đã thăm)`, en: `line 9: return 0 (water / visited)` },
        cur: [r, c],
        codeLines: [9],
        vars: [{ name: "returns", value: 0 }],
        note: { vi: `Không đếm lại ô này — đây chính là cơ chế chống đếm trùng.`, en: `Do not recount this cell — this is the dedup mechanism.` },
      });
      callStack.pop();
      return 0;
    }

    // ── Line 10: mark visited in-place (mutate the live grid) ────────
    const gridBefore = work.map((row) => row.join("")).join(" | ");
    work[r][c] = 0;
    consumed[r][c] = true;
    islandId[r][c] = island;
    curIsland.push(key(r, c));
    const gridAfter = work.map((row) => row.join("")).join(" | ");
    snap({
      title: { vi: `line 10: grid[${r}][${c}] = 0  ⟵ 1 bị ghi thành 0`, en: `line 10: grid[${r}][${c}] = 0  ⟵ 1 overwritten to 0` },
      cur: [r, c],
      codeLines: [10],
      vars: [
        { name: "grid[r][c] trước", value: 1 },
        { name: "grid[r][c] sau", value: 0 },
        { name: "grid trước", value: gridBefore },
        { name: "grid sau", value: gridAfter },
        { name: "island #", value: island },
        { name: "cells in island", value: curIsland.length },
      ],
      note: {
        vi:
          `Ô (${r},${c}) vừa đổi 1 → 0 ngay trên lưới. Đây là cách code đánh dấu "đã thăm" mà không cần mảng visited riêng:\n` +
          `lần sau nếu quay lại (${r},${c}), line 8 thấy grid[r][c] == 0 và trả về 0 luôn.\n` +
          `grid: ${gridBefore}  →  ${gridAfter}`,
        en:
          `Cell (${r},${c}) just flipped 1 → 0 in the grid. This is how the code marks "visited" without a separate visited set:\n` +
          `if we ever come back to (${r},${c}), line 8 sees grid[r][c] == 0 and returns 0 immediately.\n` +
          `grid: ${gridBefore}  →  ${gridAfter}`,
      },
    });

    // ── Line 11: return 1 + 4 recursive calls ────────────────────────
    let total = 1;
    snap({
      title: { vi: `line 11: bắt đầu tính "1 + dfs(...)×4", total = 1`, en: `line 11: start evaluating "1 + dfs(...)×4", total = 1` },
      cur: [r, c],
      codeLines: [11],
      vars: [{ name: "total (chính ô này)", value: total }],
      note: {
        vi: `Ô (${r},${c}) tự đóng góp 1. Python sẽ lần lượt gọi 4 dfs con và cộng kết quả.`,
        en: `Cell (${r},${c}) contributes 1 itself. Python now evaluates the 4 child dfs calls left-to-right and sums them.`,
      },
    });

    for (const { dr, dc, label } of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      snap({
        title: { vi: `line 11: gọi ${label} → dfs(${nr},${nc})`, en: `line 11: call ${label} → dfs(${nr},${nc})` },
        cur: [r, c],
        codeLines: [11],
        vars: [
          { name: "from", value: `(${r},${c})` },
          { name: "calling", value: `dfs(${nr},${nc})` },
          { name: "total so far", value: total },
        ],
        note: { vi: `Đẩy frame dfs(${nr},${nc}) lên call stack.`, en: `Push frame dfs(${nr},${nc}) onto the call stack.` },
      });

      const child = dfs(nr, nc);
      total += child;

      snap({
        title: { vi: `line 11: ${label} trả ${child} → total = ${total}`, en: `line 11: ${label} returned ${child} → total = ${total}` },
        cur: [r, c],
        codeLines: [11],
        vars: [
          { name: "returned", value: child },
          { name: "total", value: total },
        ],
        note: { vi: `Quay lại frame dfs(${r},${c}). Cộng ${child} → total = ${total}.`, en: `Back in frame dfs(${r},${c}). Add ${child} → total = ${total}.` },
      });
    }

    snap({
      title: { vi: `line 11: return ${total} từ dfs(${r},${c})`, en: `line 11: return ${total} from dfs(${r},${c})` },
      cur: [r, c],
      codeLines: [11],
      vars: [{ name: "returns", value: total }],
      note: {
        vi: `dfs(${r},${c}) xong: 1 + tổng 4 hướng = ${total}. Pop frame khỏi call stack.`,
        en: `dfs(${r},${c}) done: 1 + sum of 4 directions = ${total}. Pop frame off the call stack.`,
      },
    });
    callStack.pop();
    return total;
  }

  // ── Lines 12–16: outer scan ─────────────────────────────────────────
  for (let r = 0; r < rows; r++) {
    scanR = r;
    snap({
      title: { vi: `line 12: for r in range(m) → r = ${r}`, en: `line 12: for r in range(m) → r = ${r}` },
      codeLines: [12],
      vars: [{ name: "r", value: r }],
      note: { vi: `Quét dòng ${r}.`, en: `Scan row ${r}.` },
    });

    for (let c = 0; c < cols; c++) {
      scanC = c;
      snap({
        title: { vi: `line 13: for c in range(n) → c = ${c}`, en: `line 13: for c in range(n) → c = ${c}` },
        cur: [r, c],
        codeLines: [13],
        vars: [{ name: "r, c", value: `${r}, ${c}` }],
        note: { vi: `Xét ô (${r},${c}).`, en: `Inspect cell (${r},${c}).` },
      });

      const isLand = work[r][c] === 1;
      snap({
        title: { vi: `line 14: grid[${r}][${c}] == 1?`, en: `line 14: grid[${r}][${c}] == 1?` },
        cur: [r, c],
        codeLines: [14],
        vars: [
          { name: "grid[r][c]", value: work[r][c] },
          { name: "is land?", value: isLand },
        ],
        note: {
          vi: isLand
            ? `(${r},${c}) là đất chưa thăm → bắt đầu đảo mới, gọi dfs (line 15).`
            : `(${r},${c}) là nước hoặc đã thăm → bỏ qua, sang ô tiếp theo.`,
          en: isLand
            ? `(${r},${c}) is unvisited land → start a new island, call dfs (line 15).`
            : `(${r},${c}) is water or visited → skip to the next cell.`,
        },
      });
      if (!isLand) continue;

      island++;
      curIsland = [];

      snap({
        title: { vi: `line 15: area = dfs(${r}, ${c}) — vào đảo #${island}`, en: `line 15: area = dfs(${r}, ${c}) — enter island #${island}` },
        cur: [r, c],
        codeLines: [15],
        vars: [{ name: "island #", value: island }],
        note: { vi: `Gọi DFS gốc để đo diện tích đảo #${island}.`, en: `Call the root DFS to measure island #${island}.` },
      });

      const area = dfs(r, c);

      snap({
        title: { vi: `line 15: area = ${area}`, en: `line 15: area = ${area}` },
        codeLines: [15],
        vars: [{ name: "area", value: area }, { name: "island #", value: island }],
        note: { vi: `DFS gốc trả về: đảo #${island} có ${area} ô.`, en: `Root DFS returned: island #${island} has ${area} cells.` },
      });

      const prevMax = maxArea;
      const isNew = area > maxArea;
      maxArea = Math.max(maxArea, area);
      if (isNew) bestCells = new Set(curIsland);

      snap({
        title: { vi: `line 16: max_area = max(${prevMax}, ${area}) = ${maxArea}`, en: `line 16: max_area = max(${prevMax}, ${area}) = ${maxArea}` },
        codeLines: [16],
        vars: [
          { name: "max_area (trước)", value: prevMax },
          { name: "area", value: area },
          { name: "new record?", value: isNew },
        ],
        note: {
          vi: isNew
            ? `Đảo #${island} (${area} ô) vượt kỷ lục cũ (${prevMax}) → tô xanh làm đảo lớn nhất hiện tại.`
            : `Đảo #${island} (${area} ô) không vượt max_area = ${maxArea}.`,
          en: isNew
            ? `Island #${island} (${area} cells) beats the old record (${prevMax}) → highlighted as current largest.`
            : `Island #${island} (${area} cells) does not beat max_area = ${maxArea}.`,
        },
      });
    }
  }

  // ── Line 17 ─────────────────────────────────────────────────────────
  snap({
    title: { vi: `line 17: return ${maxArea}`, en: `line 17: return ${maxArea}` },
    final: true,
    codeLines: [17],
    vars: [{ name: "answer", value: maxArea }, { name: "islands found", value: island }],
    note: {
      vi: `Đã quét hết ${rows}×${cols} ô, tìm được ${island} đảo. Diện tích lớn nhất = ${maxArea} (tô xanh).`,
      en: `Scanned all ${rows}×${cols} cells, found ${island} island(s). Largest area = ${maxArea} (highlighted).`,
    },
  });

  return { original: grid, answer: maxArea, steps };
}

module.exports = problems;
