"use strict";

const bi = (vi, en) => ({ vi, en });
const COLS = "ABCDEFGH";

const CODE = [
  "class Excel:",
  "    def __init__(self, H, W):",
  "        self.values = {}",
  "        self.formulas = {}",
  "        self.users = defaultdict(set)",
  "    def set(self, r, c, v):",
  "        cell = (r, c)",
  "        self.values[cell] = v",
  "        if cell in self.formulas:",
  "            for src in self.formulas[cell]: self.users[src].remove(cell)",
  "            del self.formulas[cell]",
  "    def get(self, r, c):",
  "        return self.evaluate((r, c))",
  "    def sum(self, r, c, numbers):",
  "        cell = (r, c)",
  "        formula = Counter(expand(numbers))",
  "        for src in self.formulas.get(cell, {}): self.users[src].remove(cell)",
  "        self.formulas[cell] = formula",
  "        for src in formula: self.users[src].add(cell)",
  "        return self.evaluate(cell)",
  "    def evaluate(self, cell, memo=None):",
  "        if memo is None: memo = {}",
  "        if cell in memo: return memo[cell]",
  "        if cell not in self.formulas:",
  "            memo[cell] = self.values.get(cell, 0)",
  "            return memo[cell]",
  "        memo[cell] = sum(n * self.evaluate(src, memo) for src, n in self.formulas[cell].items())",
  "        return memo[cell]",
];

function parseCell(text, height, width) {
  const match = /^([A-H])([1-8])$/i.exec(String(text).trim());
  if (!match) throw new RangeError(`#631: Invalid cell ${text}. Use A1–H8.`);
  const col = COLS.indexOf(match[1].toUpperCase()); const row = Number(match[2]);
  if (row > height || col >= width) throw new RangeError(`#631: Cell ${text} is outside the ${height}×${COLS[width - 1]} sheet.`);
  return `${COLS[col]}${row}`;
}

function parseRef(text, height, width) {
  const parts = String(text).trim().split(":");
  if (parts.length > 2) throw new RangeError(`#631: Invalid range ${text}.`);
  const from = parseCell(parts[0], height, width);
  const to = parseCell(parts[1] ?? parts[0], height, width);
  const colA = COLS.indexOf(from[0]); const rowA = Number(from.slice(1));
  const colB = COLS.indexOf(to[0]); const rowB = Number(to.slice(1));
  const refs = [];
  for (let r = Math.min(rowA, rowB); r <= Math.max(rowA, rowB); r++) {
    for (let c = Math.min(colA, colB); c <= Math.max(colA, colB); c++) refs.push(`${COLS[c]}${r}`);
  }
  return refs;
}

function parseOperations(input, height, width) {
  if (Array.isArray(input)) input = input.join(";");
  if (typeof input !== "string" || !input.trim()) throw new RangeError("#631: Enter operations separated by ;.");
  const operations = input.split(";").map((part) => part.trim()).filter(Boolean).map((text) => {
    let match = /^set\s*\(\s*([A-H]\d+)\s*,\s*(-?\d+)\s*\)$/i.exec(text);
    if (match) return { type: "set", cell: parseCell(match[1], height, width), value: Number(match[2]), text };
    match = /^get\s*\(\s*([A-H]\d+)\s*\)$/i.exec(text);
    if (match) return { type: "get", cell: parseCell(match[1], height, width), text };
    match = /^sum\s*\(\s*([A-H]\d+)\s*,\s*(.+)\)$/i.exec(text);
    if (match) {
      const cell = parseCell(match[1], height, width);
      const refs = match[2].split(",").flatMap((ref) => parseRef(ref, height, width));
      if (!refs.length) throw new RangeError("#631: Sum needs at least one source cell or range.");
      return { type: "sum", cell, refs, text };
    }
    throw new RangeError(`#631: Invalid operation: ${text}. Use Set(A1,2), Sum(B1,A1:A2), or Get(B1).`);
  });
  if (operations.length > 12) throw new RangeError("#631: Use at most 12 operations for a readable trace.");
  return operations;
}

function parseInput(input, params = {}) {
  const height = Number(params.H ?? input?.H ?? 4);
  const widthRaw = String(params.W ?? input?.W ?? "D").trim().toUpperCase();
  const width = COLS.indexOf(widthRaw) + 1;
  const operationsInput = input && typeof input === "object" && !Array.isArray(input)
    ? (input.operations ?? input.ops ?? "") : input;
  if (!Number.isInteger(height) || height < 1 || height > 8 || width < 1 || width > 8) {
    throw new RangeError("#631: Set H from 1–8 and W to a column letter A–H.");
  }
  return { height, width, operations: parseOperations(operationsInput, height, width) };
}

function buildSteps(input, params = {}) {
  const { height, width, operations } = parseInput(input, params);
  const values = new Map(); const formulas = new Map(); const users = new Map();
  const steps = []; const outputs = [];
  let currentOp = null; let activeCell = null; let sourceCells = []; let answer = null;

  function evaluate(cell, stack = []) {
    if (stack.includes(cell)) throw new RangeError(`#631: Circular formula at ${cell}.`);
    const formula = formulas.get(cell);
    if (!formula) return values.get(cell) ?? 0;
    return [...formula].reduce((total, [source, count]) => total + count * evaluate(source, [...stack, cell]), 0);
  }

  function affected(start) {
    const result = new Set(); const queue = [start];
    while (queue.length) {
      const cell = queue.shift();
      for (const next of users.get(cell) || []) if (!result.has(next)) { result.add(next); queue.push(next); }
    }
    return [...result];
  }

  function emit(line, phase) {
    const allCells = [];
    const memo = new Map();
    for (let r = 1; r <= height; r++) for (let c = 0; c < width; c++) {
      const cell = `${COLS[c]}${r}`;
      allCells.push({ cell, value: evaluate(cell, [], memo), stored: values.get(cell) ?? null, formula: [...(formulas.get(cell) || [])].map(([ref, count]) => ({ ref, count })) });
    }
    const edges = [];
    formulas.forEach((formula, to) => formula.forEach((count, from) => edges.push({ from, to, count })));
    steps.push({
      title: bi(phase === "init" ? "Bảng trống" : currentOp ? `${currentOp.type.toUpperCase()} · ${currentOp.cell}` : "Excel",
        phase === "init" ? "Empty sheet" : currentOp ? `${currentOp.type.toUpperCase()} · ${currentOp.cell}` : "Excel"),
      note: bi("", ""), arr: [], highlight: [], mark: [], codeLines: [line], final: false,
      vars: [{ name: "cell", value: activeCell || "—" }, { name: "value", value: activeCell ? evaluate(activeCell) : "—" }, { name: "refs", value: sourceCells.join(",") || "—" }],
      excel631View: {
        height, width, cols: [...COLS.slice(0, width)], rows: Array.from({ length: height }, (_, i) => i + 1),
        cells: allCells, edges, currentOp: currentOp ? { ...currentOp, refs: currentOp.refs ? [...currentOp.refs] : undefined } : null,
        activeCell, sourceCells: [...sourceCells], affected: activeCell ? affected(activeCell) : [],
        phase, answer, outputs: [...outputs],
      },
    });
  }

  emit(1, "init"); emit(2, "init"); emit(3, "init"); emit(4, "init"); emit(5, "init");
  function traceEvaluate(cell, memo = new Map()) {
    const formula = formulas.get(cell);
    activeCell = cell; emit(21, "evaluate"); emit(22, "evaluate"); emit(23, "evaluate");
    if (memo.has(cell)) return memo.get(cell);
    emit(24, "evaluate");
    if (!formula) {
      memo.set(cell, values.get(cell) ?? 0); emit(25, "value"); emit(26, "value");
      return memo.get(cell);
    }
    let total = 0;
    for (const [source, count] of formula) {
      sourceCells = [source]; emit(27, "formula");
      total += count * traceEvaluate(source, memo);
    }
    memo.set(cell, total);
    activeCell = cell; sourceCells = [...formula.keys()]; emit(27, "formula"); emit(28, "evaluate");
    return memo.get(cell);
  }

  for (const operation of operations) {
    currentOp = operation; activeCell = operation.cell; sourceCells = operation.refs || [];
    if (operation.type === "set") {
      emit(6, "set"); emit(7, "set");
      values.set(operation.cell, operation.value); emit(8, "set");
      const old = formulas.get(operation.cell);
      emit(9, "set");
      if (old) {
        for (const source of old.keys()) {
          emit(10, "unlink");
          users.get(source)?.delete(operation.cell);
        }
        formulas.delete(operation.cell); emit(11, "set");
      }
      answer = null;
    } else if (operation.type === "get") {
      emit(12, "get"); emit(13, "get");
      answer = traceEvaluate(operation.cell, new Map()); outputs.push({ type: "get", cell: operation.cell, value: answer });
    } else {
      emit(14, "sum"); emit(15, "sum");
      const formula = new Map(); operation.refs.forEach((ref) => formula.set(ref, (formula.get(ref) || 0) + 1));
      sourceCells = operation.refs; emit(16, "sum");
      const old = formulas.get(operation.cell);
      if (old) for (const source of old.keys()) { emit(17, "unlink"); users.get(source)?.delete(operation.cell); }
      formulas.set(operation.cell, formula); emit(18, "sum");
      for (const source of formula.keys()) {
        if (!users.has(source)) users.set(source, new Set());
        users.get(source).add(operation.cell); sourceCells = [source]; emit(19, "link");
      }
      sourceCells = operation.refs; emit(20, "sum");
      answer = traceEvaluate(operation.cell, new Map()); outputs.push({ type: "sum", cell: operation.cell, value: answer });
    }
  }
  if (steps.length) steps[steps.length - 1].final = true;
  return { original: operations.map((op) => op.text), answer: outputs, steps };
}

module.exports = { 631: {
  id: 631, slug: "design-excel-sum-formula", difficulty: "hard", category: { key: "design", vi: "Thiết kế cấu trúc dữ liệu", en: "Design" },
  tags: [{ key: "design", vi: "Thiết kế", en: "Design" }, { key: "hash-table", vi: "Bảng băm", en: "Hash Table" }, { key: "graph", vi: "Đồ thị phụ thuộc", en: "Dependency Graph" }],
  title: bi("Design Excel Sum Formula", "Design Excel Sum Formula"), titleVi: bi("Thiết kế công thức SUM trong Excel", "Design Excel SUM formulas"),
  statement: bi("Đặt giá trị vào ô, cộng các ô tham chiếu và xem công thức cập nhật.", "Set cell values, sum referenced cells, and watch formulas update."),
  defaultInput: "Set(A1,2); Set(A2,3); Sum(B1,A1:A2); Get(B1); Set(A2,5); Get(B1)", inputKind: "string",
  inputLabel: bi("lệnh cách nhau bằng ;", "operations separated by ;"),
  extraParams: [{ key: "H", type: "number", label: bi("H · số hàng (1–8)", "H · rows (1–8)"), default: 4, min: 1, max: 8 }, { key: "W", type: "string", label: bi("W · cột cuối (A–H)", "W · last column (A–H)"), default: "D" }],
  debugMode: "line-by-line",
  approach: [bi("Ô thường lưu số; ô SUM lưu các tham chiếu.", "Literal cells store numbers; SUM cells store references."), bi("Đọc công thức đệ quy nên đổi ô nguồn sẽ cập nhật kết quả.", "Recursive evaluation makes formulas reflect source changes.")],
  complexity: { time: "O(cells + references)", space: "O(cells + references)", note: bi("Bộ nhớ đệm tránh tính lại ô phụ thuộc; lưới tối đa 8×8.", "Memoization avoids recalculating dependencies; the sheet is limited to 8×8.") },
  code: CODE, builder: buildSteps, liveArgs: (input, params) => [parseInput(input, params)],
} };
