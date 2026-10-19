"use strict";

function parseMatrix308(input) {
  let matrix;
  if (Array.isArray(input)) matrix = input.map((row) => Array.isArray(row) ? [...row] : row);
  else {
    const raw = String(input || "").trim();
    try {
      matrix = raw.startsWith("[")
        ? JSON.parse(raw)
        : raw.split(";").filter(Boolean).map((row) => row.split(",").map((value) => Number(value.trim())));
    } catch (_) {
      matrix = [];
    }
  }
  const cols = Array.isArray(matrix) && Array.isArray(matrix[0]) ? matrix[0].length : 0;
  const valid = Array.isArray(matrix) && matrix.length > 0 && cols > 0
    && matrix.every((row) => Array.isArray(row) && row.length === cols && row.every(Number.isFinite));
  return valid ? matrix.map((row) => row.map(Number)) : [];
}

function parseOperations308(rawValue) {
  return String(rawValue || "").split("|").map((part) => part.trim()).filter(Boolean).map((part) => {
    const tokens = part.split(/\s+/);
    return {
      name: String(tokens[0] || "").toLowerCase(),
      args: tokens.slice(1).map(Number),
      tokenCount: tokens.length,
      label: part,
    };
  });
}

function buildSteps308(input, params = {}) {
  const source = parseMatrix308(input);
  const rawOperations = String(params.operations || "").trim();
  const operations = parseOperations308(rawOperations);
  const rows = source.length;
  const cols = rows ? source[0].length : 0;
  const validOperations = rows > 0 && operations.length > 0 && operations.every((operation) => {
    if (operation.args.some((value) => !Number.isInteger(value))) return false;
    if (operation.name === "update" && operation.tokenCount === 4) {
      const [row, col] = operation.args;
      return row >= 0 && row < rows && col >= 0 && col < cols;
    }
    if (operation.name === "sumregion" && operation.tokenCount === 5) {
      const [row1, col1, row2, col2] = operation.args;
      return row1 >= 0 && row1 <= row2 && row2 < rows && col1 >= 0 && col1 <= col2 && col2 < cols;
    }
    return false;
  });

  const operationCards = operations.map((operation) => ({
    name: operation.name,
    label: operation.name === "sumregion"
      ? `Σ (${operation.args[0]},${operation.args[1]})→(${operation.args[2]},${operation.args[3]})`
      : `↻ (${operation.args[0]},${operation.args[1]})=${operation.args[2]}`,
  }));

  if (!validOperations) {
    return {
      original: { matrix: source, operations: rawOperations },
      answer: null,
      steps: [{
        title: { vi: "Dữ liệu chưa hợp lệ", en: "Invalid input" },
        codeLines: [1],
        segmentTreeView: {
          variant: "range-sum-2d-308", matrix: source, bit: [], phase: "error",
          operations: operationCards, operationIndex: -1, completedOperations: 0,
          activeMatrix: [], activeBit: [], outputs: [], action: "update r c value | sumRegion r1 c1 r2 c2",
        },
        vars: [{ name: "operations", value: rawOperations || "-" }],
        note: { vi: "Ma trận phải vuông góc và mỗi thao tác phải đúng cú pháp.", en: "Use a rectangular matrix and valid operation syntax." },
        final: true,
      }],
    };
  }

  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  const bit = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));
  const outputs = [];
  const steps = [];

  const coords = (items) => items.map(([row, col]) => [row, col]);
  const matrixText = () => JSON.stringify(matrix);
  const bitText = () => JSON.stringify(bit);

  function snapshot({
    title, codeLine, phase = "build", operationIndex = -1, completedOperations = 0,
    activeMatrix = [], activeBit = [], visitedBit = [], queryRect = null, prefixRect = null,
    cornerValues = [], cornerSigns = [], delta = null, total = null, answer = null,
    action = "", equation = "", vars = [], note = null, final = false,
  }) {
    const step = {
      title,
      codeLines: [codeLine],
      segmentTreeView: {
        variant: "range-sum-2d-308",
        matrix: matrix.map((row) => [...row]),
        bit: bit.map((row) => [...row]),
        phase,
        operations: operationCards,
        operationIndex,
        completedOperations,
        outputs: [...outputs],
        activeMatrix: coords(activeMatrix),
        activeBit: coords(activeBit),
        visitedBit: coords(visitedBit),
        queryRect: queryRect ? [...queryRect] : null,
        prefixRect: prefixRect ? [...prefixRect] : null,
        cornerValues: [...cornerValues],
        cornerSigns: [...cornerSigns],
        delta,
        total,
        answer,
        action,
        equation,
      },
      vars: [
        { name: "matrix", value: matrixText() },
        { name: "bit", value: bitText() },
        ...vars,
      ],
      note: note || title,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  snapshot({
    title: { vi: `Tạo matrix ${rows}×${cols}`, en: `Create a ${rows}×${cols} matrix` },
    codeLine: 3,
    action: `${rows} × ${cols}`,
    equation: "matrix = 0",
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
  });
  snapshot({
    title: { vi: "Tạo Fenwick 2D có viền 0", en: "Create a zero-padded 2D Fenwick tree" },
    codeLine: 5,
    action: `BIT ${(rows + 1)} × ${(cols + 1)}`,
    equation: "bit[0][*] = bit[*][0] = 0",
  });

  function touchUpdate(row, col, delta) {
    const touched = [];
    for (let i = row + 1; i <= rows; i += i & -i) {
      for (let j = col + 1; j <= cols; j += j & -j) {
        bit[i][j] += delta;
        touched.push([i, j]);
      }
    }
    return touched;
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const value = source[row][col];
      matrix[row][col] = value;
      const touched = touchUpdate(row, col, value);
      snapshot({
        title: { vi: `Nạp ô (${row}, ${col})`, en: `Load cell (${row}, ${col})` },
        codeLine: 8,
        phase: "build",
        activeMatrix: [[row, col]],
        activeBit: touched,
        delta: value,
        action: `(${row},${col}) → ${value}`,
        equation: `+${value} → ${touched.length} BIT cells`,
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "value", value }],
      });
    }
  }

  function updateOperation(row, col, value, operationIndex) {
    const delta = value - matrix[row][col];
    snapshot({
      title: { vi: `Tính delta tại (${row}, ${col})`, en: `Compute delta at (${row}, ${col})` },
      codeLine: 11, phase: "update", operationIndex, completedOperations: operationIndex,
      activeMatrix: [[row, col]], delta, action: `${value} − ${matrix[row][col]}`, equation: `delta = ${delta}`,
      vars: [{ name: "delta", value: delta }],
    });
    matrix[row][col] = value;
    snapshot({
      title: { vi: "Đổi ô nguồn", en: "Change the source cell" },
      codeLine: 12, phase: "update", operationIndex, completedOperations: operationIndex,
      activeMatrix: [[row, col]], delta, action: `matrix[${row}][${col}]`, equation: `= ${value}`,
    });
    let i = row + 1;
    snapshot({
      title: { vi: "Đổi sang chỉ số BIT", en: "Convert to BIT coordinates" },
      codeLine: 13, phase: "update", operationIndex, completedOperations: operationIndex,
      activeMatrix: [[row, col]], activeBit: [[i, col + 1]], delta, action: `i = ${row} + 1`, equation: `i = ${i}`,
    });
    const visited = [];
    while (i <= rows) {
      snapshot({
        title: { vi: `Hàng BIT i=${i}`, en: `BIT row i=${i}` },
        codeLine: 14, phase: "update", operationIndex, completedOperations: operationIndex,
        activeMatrix: [[row, col]], activeBit: [[i, col + 1]], visitedBit: visited, delta,
        action: `${i} ≤ ${rows}`, equation: "enter row",
      });
      let j = col + 1;
      snapshot({
        title: { vi: `Bắt đầu cột j=${j}`, en: `Start column j=${j}` },
        codeLine: 15, phase: "update", operationIndex, completedOperations: operationIndex,
        activeMatrix: [[row, col]], activeBit: [[i, j]], visitedBit: visited, delta,
        action: `j = ${col} + 1`, equation: `j = ${j}`,
      });
      while (j <= cols) {
        snapshot({
          title: { vi: `Ô BIT (${i}, ${j})`, en: `BIT cell (${i}, ${j})` },
          codeLine: 16, phase: "update", operationIndex, completedOperations: operationIndex,
          activeMatrix: [[row, col]], activeBit: [[i, j]], visitedBit: visited, delta,
          action: `${j} ≤ ${cols}`, equation: "touch",
        });
        bit[i][j] += delta;
        visited.push([i, j]);
        snapshot({
          title: { vi: `Cộng delta vào BIT`, en: `Add delta to BIT` },
          codeLine: 17, phase: "update", operationIndex, completedOperations: operationIndex,
          activeMatrix: [[row, col]], activeBit: [[i, j]], visitedBit: visited, delta,
          action: `BIT[${i}][${j}] += ${delta}`, equation: `= ${bit[i][j]}`,
        });
        const nextJ = j + (j & -j);
        snapshot({
          title: { vi: `Nhảy cột ${j} → ${nextJ}`, en: `Jump column ${j} → ${nextJ}` },
          codeLine: 18, phase: "update", operationIndex, completedOperations: operationIndex,
          activeMatrix: [[row, col]], activeBit: [[i, j]], visitedBit: visited, delta,
          action: `j += lowbit(${j})`, equation: `${j} → ${nextJ}`,
        });
        j = nextJ;
      }
      const nextI = i + (i & -i);
      snapshot({
        title: { vi: `Nhảy hàng ${i} → ${nextI}`, en: `Jump row ${i} → ${nextI}` },
        codeLine: 19, phase: "update", operationIndex, completedOperations: operationIndex,
        activeMatrix: [[row, col]], activeBit: visited.length ? [visited.at(-1)] : [], visitedBit: visited, delta,
        action: `i += lowbit(${i})`, equation: `${i} → ${nextI}`,
      });
      i = nextI;
    }
    outputs.push(null);
    snapshot({
      title: { vi: "Update hoàn tất", en: "Update complete" },
      codeLine: 19, phase: "answer", operationIndex, completedOperations: operationIndex + 1,
      activeMatrix: [[row, col]], visitedBit: visited, delta, action: "✓", equation: `matrix[${row}][${col}] = ${value}`,
    });
  }

  function prefixTrace(row, col, operationIndex, queryRect, cornerValues, cornerSigns, cornerIndex) {
    let total = 0;
    const visited = [];
    const prefixRect = row >= 0 && col >= 0 ? [0, 0, row, col] : null;
    snapshot({
      title: { vi: `Prefix góc (${row}, ${col})`, en: `Prefix corner (${row}, ${col})` },
      codeLine: 22, phase: "query", operationIndex, completedOperations: operationIndex,
      queryRect, prefixRect, cornerValues, cornerSigns, total, action: `P(${row},${col})`, equation: "total = 0",
    });
    let i = row + 1;
    snapshot({
      title: { vi: `i = ${i}`, en: `i = ${i}` },
      codeLine: 23, phase: "query", operationIndex, completedOperations: operationIndex,
      queryRect, prefixRect, cornerValues, cornerSigns, total, activeBit: i > 0 && col >= 0 ? [[i, col + 1]] : [],
      action: `i = ${row} + 1`, equation: `i = ${i}`,
    });
    while (i > 0) {
      snapshot({
        title: { vi: `Đọc hàng BIT i=${i}`, en: `Read BIT row i=${i}` },
        codeLine: 24, phase: "query", operationIndex, completedOperations: operationIndex,
        queryRect, prefixRect, cornerValues, cornerSigns, total, visitedBit: visited,
        action: `${i} > 0`, equation: "scan row",
      });
      let j = col + 1;
      snapshot({
        title: { vi: `j = ${j}`, en: `j = ${j}` },
        codeLine: 25, phase: "query", operationIndex, completedOperations: operationIndex,
        queryRect, prefixRect, cornerValues, cornerSigns, total, activeBit: j > 0 ? [[i, j]] : [], visitedBit: visited,
        action: `j = ${col} + 1`, equation: `j = ${j}`,
      });
      while (j > 0) {
        snapshot({
          title: { vi: `Lấy BIT (${i}, ${j})`, en: `Take BIT (${i}, ${j})` },
          codeLine: 26, phase: "query", operationIndex, completedOperations: operationIndex,
          queryRect, prefixRect, cornerValues, cornerSigns, total, activeBit: [[i, j]], visitedBit: visited,
          action: `${j} > 0`, equation: "take",
        });
        total += bit[i][j];
        visited.push([i, j]);
        snapshot({
          title: { vi: `Cộng ${bit[i][j]}`, en: `Add ${bit[i][j]}` },
          codeLine: 27, phase: "query", operationIndex, completedOperations: operationIndex,
          queryRect, prefixRect, cornerValues, cornerSigns, total, activeBit: [[i, j]], visitedBit: visited,
          action: `total += BIT[${i}][${j}]`, equation: `total = ${total}`,
        });
        const nextJ = j - (j & -j);
        snapshot({
          title: { vi: `Lùi cột ${j} → ${nextJ}`, en: `Move column ${j} → ${nextJ}` },
          codeLine: 28, phase: "query", operationIndex, completedOperations: operationIndex,
          queryRect, prefixRect, cornerValues, cornerSigns, total, activeBit: [[i, j]], visitedBit: visited,
          action: `j -= lowbit(${j})`, equation: `${j} → ${nextJ}`,
        });
        j = nextJ;
      }
      const nextI = i - (i & -i);
      snapshot({
        title: { vi: `Lùi hàng ${i} → ${nextI}`, en: `Move row ${i} → ${nextI}` },
        codeLine: 29, phase: "query", operationIndex, completedOperations: operationIndex,
        queryRect, prefixRect, cornerValues, cornerSigns, total, visitedBit: visited,
        action: `i -= lowbit(${i})`, equation: `${i} → ${nextI}`,
      });
      i = nextI;
    }
    cornerValues[cornerIndex] = total;
    snapshot({
      title: { vi: `P(${row}, ${col}) = ${total}`, en: `P(${row}, ${col}) = ${total}` },
      codeLine: 30, phase: "query", operationIndex, completedOperations: operationIndex,
      queryRect, prefixRect, cornerValues, cornerSigns, total, visitedBit: visited,
      action: `P(${row},${col})`, equation: `= ${total}`,
    });
    return total;
  }

  function queryOperation(row1, col1, row2, col2, operationIndex, isLast) {
    const queryRect = [row1, col1, row2, col2];
    const cornerSigns = ["+", "−", "−", "+"];
    const cornerValues = [null, null, null, null];
    snapshot({
      title: { vi: "Đánh dấu hình chữ nhật", en: "Mark the query rectangle" },
      codeLine: 33, phase: "query", operationIndex, completedOperations: operationIndex,
      queryRect, cornerValues, cornerSigns, action: `(${row1},${col1}) → (${row2},${col2})`, equation: "4 prefix corners",
    });
    const a = prefixTrace(row2, col2, operationIndex, queryRect, cornerValues, cornerSigns, 0);
    const b = prefixTrace(row1 - 1, col2, operationIndex, queryRect, cornerValues, cornerSigns, 1);
    const c = prefixTrace(row2, col1 - 1, operationIndex, queryRect, cornerValues, cornerSigns, 2);
    const d = prefixTrace(row1 - 1, col1 - 1, operationIndex, queryRect, cornerValues, cornerSigns, 3);
    const answer = a - b - c + d;
    outputs.push(answer);
    snapshot({
      title: { vi: `Tổng vùng = ${answer}`, en: `Region sum = ${answer}` },
      codeLine: 34, phase: "answer", operationIndex, completedOperations: operationIndex + 1,
      queryRect, cornerValues, cornerSigns, answer, total: answer,
      action: `${a} − ${b} − ${c} + ${d}`, equation: `= ${answer}`,
      final: isLast,
    });
  }

  operations.forEach((operation, operationIndex) => {
    if (operation.name === "update") updateOperation(...operation.args, operationIndex);
    else queryOperation(...operation.args, operationIndex, operationIndex === operations.length - 1);
  });

  if (steps.length && !steps.at(-1).final) steps.at(-1).final = true;
  return { original: { matrix: source, operations: rawOperations }, answer: outputs, steps };
}

module.exports = {
  308: {
    id: 308,
    difficulty: "medium",
    slug: "range-sum-query-2d-mutable",
    category: { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
    tags: [
      { key: "fenwick-tree", vi: "Fenwick Tree", en: "Fenwick Tree" },
      { key: "matrix", vi: "Ma trận", en: "Matrix" },
    ],
    title: { vi: "Range Sum Query 2D - Mutable", en: "Range Sum Query 2D - Mutable" },
    titleVi: { vi: "Một ô đổi, các vùng BIT lan theo hai chiều", en: "One cell changes, BIT regions ripple in two dimensions" },
    statement: {
      vi: "Thiết kế NumMatrix hỗ trợ đổi một ô và tính tổng một hình chữ nhật nhiều lần.",
      en: "Design NumMatrix to update one cell and repeatedly sum any rectangular region.",
    },
    defaultInput: "[[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]",
    inputKind: "string",
    inputLabel: { vi: "matrix (JSON)", en: "matrix (JSON)" },
    extraParams: [{
      key: "operations",
      type: "string",
      label: { vi: "Thao tác, ngăn bằng |", en: "Operations, separated by |" },
      default: "sumRegion 2 1 4 3 | update 3 2 2 | sumRegion 2 1 4 3",
    }],
    approach: [
      { vi: "Mỗi ô Fenwick 2D giữ tổng một hình chữ nhật lowbit.", en: "Each 2D Fenwick cell stores one lowbit rectangle." },
      { vi: "Update lan sang phải và xuống dưới bằng lowbit.", en: "An update ripples right and downward by lowbit jumps." },
      { vi: "Một vùng bằng bốn prefix: + góc lớn, − hai dải, + phần giao.", en: "A region uses four prefixes: + the large corner, − two strips, + their overlap." },
    ],
    complexity: {
      time: "O(mn log m · log n) build, O(log m · log n) update/query",
      space: "O(mn)",
      note: { vi: "Mỗi thao tác chỉ chạm các ô theo bước nhảy lowbit ở hai chiều.", en: "Each operation touches only lowbit-jump cells in both dimensions." },
    },
    code: [
      "class NumMatrix:",
      "    def __init__(self, matrix):",
      "        self.rows, self.cols = len(matrix), len(matrix[0])",
      "        self.matrix = [[0] * self.cols for _ in range(self.rows)]",
      "        self.bit = [[0] * (self.cols + 1) for _ in range(self.rows + 1)]",
      "        for row in range(self.rows):",
      "            for col in range(self.cols):",
      "                self.update(row, col, matrix[row][col])",
      "",
      "    def update(self, row, col, val):",
      "        delta = val - self.matrix[row][col]",
      "        self.matrix[row][col] = val",
      "        i = row + 1",
      "        while i <= self.rows:",
      "            j = col + 1",
      "            while j <= self.cols:",
      "                self.bit[i][j] += delta",
      "                j += j & -j",
      "            i += i & -i",
      "",
      "    def prefix(self, row, col):",
      "        total = 0",
      "        i = row + 1",
      "        while i > 0:",
      "            j = col + 1",
      "            while j > 0:",
      "                total += self.bit[i][j]",
      "                j -= j & -j",
      "            i -= i & -i",
      "        return total",
      "",
      "    def sumRegion(self, row1, col1, row2, col2):",
      "        return (self.prefix(row2, col2) - self.prefix(row1 - 1, col2)",
      "                - self.prefix(row2, col1 - 1) + self.prefix(row1 - 1, col1 - 1))",
    ],
    debugMode: "line-by-line",
    builder: buildSteps308,
  },
};

