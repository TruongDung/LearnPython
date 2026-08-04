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
  function cells(current,discovered){const queued=new Set(stack.map(([r,c])=>`${r},${c}`));return grid.map((matrixRow,r)=>matrixRow.map((value,c)=>{let cls=value===0?"wall":"empty",label=owner[r][c]?String(owner[r][c]):String(value);if(owner[r][c])cls="visited";if(best.has(`${r},${c}`))cls="path";if(queued.has(`${r},${c}`))cls="queued";if(discovered&&discovered[0]===r&&discovered[1]===c)cls="path";if(current&&current[0]===r&&current[1]===c)cls="current";return{label,cls};}));}
  const{steps,push}=recorder(rows,cols,cells,()=>stack);push(4,tr("Bắt đầu maxAreaOfIsland","Enter maxAreaOfIsland"),tr("Flood fill từng đảo và giữ area lớn nhất.","Flood-fill each island and keep the largest area."));push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Lưu kích thước grid.","Store grid dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});push(6,tr("Khai báo 4 hướng","Define four directions"),tr("Đảo nối theo cạnh.","Islands connect by edges."));push(7,tr("max_area = 0","max_area = 0"),tr("Khởi tạo diện tích lớn nhất.","Initialize the largest area."),{vars:[{name:"max_area",value:0}]});
  for(let row=0;row<rows;row++){push(8,tr(`Scan row = ${row}`,`Scan row = ${row}`),tr("Quét hàng.","Scan a row."),{vars:[{name:"row",value:row}]});for(let col=0;col<cols;col++){push(9,tr(`Scan (${row},${col})`,`Scan (${row},${col})`),tr("Xét ô hiện tại.","Inspect the current cell."),{current:[row,col],vars:[{name:"col",value:col},{name:"grid[row][col]",value:grid[row][col]}]});const land=grid[row][col]===1;push(10,tr(`grid[${row}][${col}] != 1 → ${!land}`,`grid[${row}][${col}] != 1 → ${!land}`),land?tr("Bắt đầu đo một đảo mới.","Start measuring a new island."):tr("Không phải đất chưa thăm; continue.","Not unvisited land; continue."),{current:[row,col],vars:[{name:"unvisited land?",value:land}]});if(!land)continue;island++;stack=[[row,col]];push(11,tr(`stack = [(${row},${col})]`,`stack = [(${row},${col})]`),tr("Khởi tạo stack cho đảo.","Initialize the island stack."),{current:[row,col]});grid[row][col]=0;owner[row][col]=island;push(12,tr(`grid[${row}][${col}] = 0`,`grid[${row}][${col}] = 0`),tr("Đánh dấu ô đầu tiên đã thăm.","Mark the first cell visited."),{current:[row,col],discovered:[row,col]});let area=0,currentCells=[];push(13,tr("area = 0","area = 0"),tr("Bắt đầu đếm diện tích đảo.","Begin counting island area."),{vars:[{name:"area",value:area}]});while(stack.length){push(14,tr("while stack → True","while stack → True"),tr("Stack còn đất cần đếm.","The stack still has land to count."));const[currentRow,currentCol]=stack.pop();push(15,tr(`pop → (${currentRow},${currentCol})`,`pop → (${currentRow},${currentCol})`),tr("Lấy một ô đất khỏi stack.","Pop one land cell."),{current:[currentRow,currentCol],vars:[{name:"current_row",value:currentRow},{name:"current_col",value:currentCol}]});area++;currentCells.push(`${currentRow},${currentCol}`);push(16,tr(`area += 1 → ${area}`,`area += 1 → ${area}`),tr("Mỗi ô pop ra đóng góp một đơn vị diện tích.","Each popped cell contributes one area unit."),{current:[currentRow,currentCol],vars:[{name:"area",value:area}]});for(const[deltaRow,deltaCol]of directions){push(17,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét neighbor.","Inspect a neighbor."),{current:[currentRow,currentCol],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});const nextRow=currentRow+deltaRow,nextCol=currentCol+deltaCol;push(18,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[currentRow,currentCol],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});const nextLand=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols&&grid[nextRow][nextCol]===1;push(19,tr(`Neighbor là land → ${nextLand}`,`Neighbor is land → ${nextLand}`),nextLand?tr("Neighbor thuộc đảo hiện tại.","The neighbor belongs to this island."):tr("Bỏ qua neighbor.","Skip the neighbor."),{current:nextLand?[nextRow,nextCol]:[currentRow,currentCol],vars:[{name:"unvisited land?",value:nextLand}]});if(!nextLand)continue;grid[nextRow][nextCol]=0;owner[nextRow][nextCol]=island;push(20,tr(`grid[${nextRow}][${nextCol}] = 0`,`grid[${nextRow}][${nextCol}] = 0`),tr("Đánh dấu neighbor đã thăm.","Mark the neighbor visited."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});stack.push([nextRow,nextCol]);push(21,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack.","Push the neighbor."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});}}push(14,tr("while stack → False","while stack → False"),tr(`Đảo có area = ${area}.`,`The island area is ${area}.`));if(area>maxArea){maxArea=area;best.clear();for(const cell of currentCells)best.add(cell);}push(22,tr(`max_area = max(max_area, ${area}) → ${maxArea}`,`max_area = max(max_area, ${area}) → ${maxArea}`),tr("Cập nhật diện tích lớn nhất sau đảo này.","Update the largest area after this island."),{vars:[{name:"area",value:area},{name:"max_area",value:maxArea}]});}}
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

const problems = {
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
    approach: [tr("Flood fill từng đảo chưa thăm trong grid2.", "Flood-fill each unvisited island in grid2."),tr("is_sub bắt đầu True và thành False nếu bất kỳ ô nào nằm trên nước grid1.", "is_sub starts True and becomes False if any cell lies over grid1 water."),tr("Chỉ tăng count sau khi đã duyệt toàn bộ đảo.", "Increment count only after traversing the entire island.")],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô grid2 được xử lý tối đa một lần.", "Each grid2 cell is processed at most once.") },
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
    ], builder: buildSteps1905,
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
