"use strict";

const { bi, parseRows } = require("./hard-viz-shared");

const PROBLEM_ID = 2128;
const MAX_ROWS = 16;
const MAX_COLUMNS = 16;

const SOURCE = Object.freeze([
  "class Solution:",
  "    def removeOnes(self, grid: list[list[int]]) -> bool:",
  "        first = grid[0]",
  "",
  "        for row in grid[1:]:",
  "            same = all(a == b for a, b in zip(row, first))",
  "            opposite = all(a != b for a, b in zip(row, first))",
  "",
  "            if not (same or opposite):",
  "                return False",
  "",
  "        return True",
]);

function parseGrid2128(input) {
  const grid = parseRows(input, {
    problemId: PROBLEM_ID,
    name: "grid",
    minRows: 1,
    maxRows: MAX_ROWS,
    minValue: 0,
    maxValue: 1,
  });
  const columns = grid[0].length;
  if (columns < 1 || columns > MAX_COLUMNS) {
    throw new RangeError(`#${PROBLEM_ID}: grid phải có 1..${MAX_COLUMNS} cột / grid must have 1..${MAX_COLUMNS} columns.`);
  }
  if (grid.some((row) => row.length !== columns)) {
    throw new TypeError(`#${PROBLEM_ID}: grid phải là ma trận chữ nhật / grid must be rectangular.`);
  }
  return grid;
}

function buildSteps2128(input) {
  const original = parseGrid2128(input);
  const rows = original.length;
  const columns = original[0].length;
  const first = [...original[0]];
  const columnFlips = first.map((bit, column) => bit === 1 ? column : -1).filter((column) => column >= 0);
  const normalized = original.map((row) => row.map((bit, column) => bit ^ first[column]));
  const rowStates = Array.from({ length: rows }, (_, row) => row === 0 ? "same" : "pending");
  const rowFlips = [];
  const steps = [];

  const emit = ({ phase, title, note, codeLines, activeRow = null, contradiction = [], answer = null, final = false }) => {
    const revealed = normalized.map((row, rowIndex) => row.map((bit) => rowIndex === 0 || rowStates[rowIndex] !== "pending" || rowIndex === activeRow ? bit : null));
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: activeRow === null ? [] : [...normalized[activeRow]],
      sub: activeRow === null ? [] : normalized[activeRow].map((_, column) => `c${column}`),
      highlight: contradiction,
      mark: activeRow === null ? [] : normalized[activeRow].map((_, column) => column),
      vars: [
        { name: "first", value: `[${first.join(", ")}]` },
        { name: "column flips", value: `[${columnFlips.join(", ")}]` },
        { name: "row flips", value: `[${rowFlips.join(", ")}]` },
        ...(activeRow === null ? [] : [{ name: "row", value: activeRow }]),
      ],
      removeOnes2128View: {
        phase,
        rows,
        columns,
        original: original.map((row) => [...row]),
        first: [...first],
        normalized: normalized.map((row) => [...row]),
        revealed,
        rowStates: [...rowStates],
        columnFlips: [...columnFlips],
        rowFlips: [...rowFlips],
        activeRow,
        contradiction: [...contradiction],
        answer,
      },
    });
  };

  emit({
    phase: "intro",
    title: bi("Chọn hàng đầu làm mẫu", "Use the first row as the pattern"),
    note: bi("Mỗi hàng hợp lệ phải giống hệt hàng đầu hoặc là bù bit hoàn toàn của nó.", "Every valid row must equal the first row or be its complete bitwise complement."),
    codeLines: [2, 3],
  });
  emit({
    phase: "columns",
    title: bi(`Lật ${columnFlips.length} cột để hàng đầu thành 0`, `Flip ${columnFlips.length} columns to zero the first row`),
    note: bi(
      columnFlips.length ? `Lật các cột [${columnFlips.join(", ")}]. Phép này tương đương XOR mọi hàng với first.` : "Hàng đầu đã toàn 0 nên không cần lật cột.",
      columnFlips.length ? `Flip columns [${columnFlips.join(", ")}]. This is equivalent to XORing every row with first.` : "The first row is already all zeroes, so no column flip is needed.",
    ),
    codeLines: [3],
    activeRow: 0,
  });

  let answer = true;
  for (let rowIndex = 1; rowIndex < rows; rowIndex++) {
    const row = original[rowIndex];
    const same = row.every((bit, column) => bit === first[column]);
    const opposite = row.every((bit, column) => bit !== first[column]);
    const zeros = normalized[rowIndex].map((bit, column) => bit === 0 ? column : -1).filter((column) => column >= 0);
    const ones = normalized[rowIndex].map((bit, column) => bit === 1 ? column : -1).filter((column) => column >= 0);
    emit({
      phase: "compare",
      activeRow: rowIndex,
      title: bi(`So sánh hàng ${rowIndex} với hàng đầu`, `Compare row ${rowIndex} with the first row`),
      note: bi(`XOR thu được [${normalized[rowIndex].join(", ")}]. Chỉ chấp nhận toàn 0 hoặc toàn 1.`, `XOR gives [${normalized[rowIndex].join(", ")}]. Only all-zero or all-one rows are allowed.`),
      codeLines: [5, 6, 7],
    });

    if (!same && !opposite) {
      answer = false;
      rowStates[rowIndex] = "invalid";
      const contradiction = [zeros[0], ones[0]].filter((column) => Number.isSafeInteger(column));
      emit({
        phase: "invalid",
        activeRow: rowIndex,
        contradiction,
        answer: false,
        title: bi(`Hàng ${rowIndex} trộn cả 0 và 1 sau chuẩn hóa`, `Row ${rowIndex} mixes 0 and 1 after normalization`),
        note: bi(`Cột ${zeros[0]} cần giữ hàng, nhưng cột ${ones[0]} lại cần lật hàng. Không thể thỏa cả hai.`, `Column ${zeros[0]} needs the row unchanged, while column ${ones[0]} needs it flipped. Both cannot be satisfied.`),
        codeLines: [9, 10],
      });
      break;
    }

    rowStates[rowIndex] = same ? "same" : "opposite";
    if (opposite) rowFlips.push(rowIndex);
    emit({
      phase: same ? "same" : "opposite",
      activeRow: rowIndex,
      title: same
        ? bi(`Hàng ${rowIndex} giống hàng đầu → đã toàn 0`, `Row ${rowIndex} matches first → already all zeroes`)
        : bi(`Hàng ${rowIndex} bù bit → lật cả hàng`, `Row ${rowIndex} is complementary → flip the row`),
      note: same
        ? bi("Sau các column flips, hàng này không cần thao tác thêm.", "After the column flips, this row needs no further operation.")
        : bi(`Sau column flips hàng là toàn 1; lật hàng ${rowIndex} để thành toàn 0.`, `After column flips the row is all ones; flip row ${rowIndex} to make it all zeroes.`),
      codeLines: [6, 7, 9],
    });
  }

  emit({
    phase: answer ? "success" : "failure",
    activeRow: answer ? null : rowStates.findIndex((state) => state === "invalid"),
    contradiction: answer ? [] : (() => {
      const badRow = rowStates.findIndex((state) => state === "invalid");
      const zero = normalized[badRow].findIndex((bit) => bit === 0);
      const one = normalized[badRow].findIndex((bit) => bit === 1);
      return [zero, one].filter((column) => column >= 0);
    })(),
    answer,
    final: true,
    title: answer ? bi("Có thể xóa mọi số 1", "All ones can be removed") : bi("Không thể xóa mọi số 1", "Not all ones can be removed"),
    note: answer
      ? bi(`Lật cột [${columnFlips.join(", ")}], rồi lật hàng [${rowFlips.join(", ")}].`, `Flip columns [${columnFlips.join(", ")}], then rows [${rowFlips.join(", ")}].`)
      : bi("Một hàng không giống cũng không bù bit so với hàng đầu, nên không tồn tại chuỗi flips hợp lệ.", "A row is neither equal to nor complementary to the first row, so no valid flip sequence exists."),
    codeLines: answer ? [12] : [10],
  });

  return { original: original.map((row) => [...row]), answer, steps };
}

module.exports = {
  2128: {
    id: 2128,
    difficulty: "medium",
    slug: "remove-all-ones-with-row-and-column-flips",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "matrix", vi: "Ma trận", en: "Matrix" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
      { key: "bitwise-xor", vi: "XOR theo bit", en: "Bitwise XOR" },
    ],
    title: bi("Remove All Ones With Row and Column Flips", "Remove All Ones With Row and Column Flips"),
    titleVi: bi("Xóa mọi số 1 bằng cách lật hàng và cột", "Remove all ones using row and column flips"),
    statement: bi(
      "Cho ma trận nhị phân. Mỗi thao tác lật mọi bit của một hàng hoặc một cột. Kiểm tra có thể biến toàn bộ ma trận thành 0 hay không.",
      "Given a binary matrix, each operation flips every bit in one row or one column. Determine whether the entire matrix can become zero.",
    ),
    defaultInput: "0,1,0;1,0,1;0,1,0",
    inputKind: "string",
    inputLabel: bi("Ma trận nhị phân; dùng ; ngăn hàng (tối đa 16×16)", "Binary matrix; separate rows with ; (up to 16×16)"),
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      bi("Dùng hàng đầu làm mẫu; lật mọi cột có bit 1 ở hàng đầu để hàng này thành toàn 0.", "Use the first row as a pattern; flip each column where its bit is 1 to make it all zeroes."),
      bi("Sau các column flips, mỗi hàng khác bằng row XOR first: nó phải toàn 0 hoặc toàn 1.", "After the column flips, every other row equals row XOR first: it must be all zeroes or all ones."),
      bi("Hàng toàn 1 có thể lật một lần; hàng trộn 0/1 chứng minh đáp án là False.", "An all-one row can be flipped once; a mixed row proves the answer is False."),
    ],
    complexity: {
      time: "O(m · n)",
      space: "O(1) algorithm",
      note: bi("Chỉ so sánh từng ô với hàng đầu; các bản sao ma trận chỉ phục vụ visualization.", "Only compare each cell with the first row; matrix snapshots are visualization-only."),
    },
    code: SOURCE,
    liveArgs: (input) => [parseGrid2128(input)],
    builder: buildSteps2128,
  },
};
