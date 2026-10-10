"use strict";

const { bi, parsePlainParams } = require("./hard-viz-shared");

const PROBLEM_ID = 2018;
const MAX_SIDE = 14;
const MAX_TRACE_STEPS = 240;

const SOURCE = Object.freeze([
  "class Solution:",
  "    def placeWordInCrossword(self, board: list[list[str]], word: str) -> bool:",
  "        rows, cols = len(board), len(board[0])",
  "",
  "        def fits(slot: str, target: str) -> bool:",
  "            return len(slot) == len(target) and all(",
  "                cell == ' ' or cell == char",
  "                for cell, char in zip(slot, target)",
  "            )",
  "",
  "        lines = board + [list(column) for column in zip(*board)]",
  "",
  "        for line in lines:",
  "            for slot in ''.join(line).split('#'):",
  "                if fits(slot, word) or fits(slot, word[::-1]):",
  "                    return True",
  "",
  "        return False",
]);

function parseBoard2018(input) {
  let board = input;
  if (typeof input === "string") {
    try {
      board = JSON.parse(input);
    } catch (_error) {
      throw new TypeError(`#${PROBLEM_ID}: board phải là ma trận JSON hợp lệ / board must be a valid JSON matrix.`);
    }
  }
  if (!Array.isArray(board) || board.length < 1 || board.length > MAX_SIDE) {
    throw new RangeError(`#${PROBLEM_ID}: board phải có 1..${MAX_SIDE} hàng / board must have 1..${MAX_SIDE} rows.`);
  }
  const columns = Array.isArray(board[0]) ? board[0].length : 0;
  if (columns < 1 || columns > MAX_SIDE || board.some((row) => !Array.isArray(row) || row.length !== columns)) {
    throw new TypeError(`#${PROBLEM_ID}: board phải là ma trận chữ nhật 1..${MAX_SIDE} cột / board must be a rectangular matrix with 1..${MAX_SIDE} columns.`);
  }
  return board.map((row, rowIndex) => row.map((cell, columnIndex) => {
    if (typeof cell !== "string" || !/^(#| |[a-z])$/.test(cell)) {
      throw new TypeError(`#${PROBLEM_ID}: board[${rowIndex}][${columnIndex}] phải là '#', khoảng trắng, hoặc a-z.`);
    }
    return cell;
  }));
}

function parseWord2018(params) {
  const parsedParams = parsePlainParams(params, PROBLEM_ID);
  const word = Object.prototype.hasOwnProperty.call(parsedParams, "word") ? parsedParams.word : "abc";
  if (typeof word !== "string" || word.length < 1 || word.length > MAX_SIDE || !/^[a-z]+$/.test(word)) {
    throw new RangeError(`#${PROBLEM_ID}: word phải gồm 1..${MAX_SIDE} chữ thường a-z / word must contain 1..${MAX_SIDE} lowercase letters.`);
  }
  return word;
}

function collectSlots(board) {
  const rows = board.length;
  const columns = board[0].length;
  const slots = [];
  const visitLine = (direction, lineIndex, length, cellAt) => {
    let start = 0;
    while (start < length) {
      while (start < length && cellAt(start).value === "#") start += 1;
      if (start === length) break;
      let end = start;
      const cells = [];
      while (end < length && cellAt(end).value !== "#") {
        cells.push(cellAt(end));
        end += 1;
      }
      slots.push({
        id: slots.length,
        direction,
        lineIndex,
        start,
        end: end - 1,
        cells,
        text: cells.map((cell) => cell.value).join(""),
      });
      start = end + 1;
    }
  };
  for (let row = 0; row < rows; row++) {
    visitLine("horizontal", row, columns, (column) => ({ row, column, value: board[row][column] }));
  }
  for (let column = 0; column < columns; column++) {
    visitLine("vertical", column, rows, (row) => ({ row, column, value: board[row][column] }));
  }
  return slots;
}

function buildSteps2018(input, params = {}) {
  const board = parseBoard2018(input);
  const word = parseWord2018(params);
  const slots = collectSlots(board);
  const steps = [];
  const checked = [];
  let traceTruncated = false;
  let answer = false;
  let winningSlot = null;
  let winningOrientation = null;

  const emit = ({ phase, title, note, codeLines, slot = null, orientation = null, checks = [], final = false }) => {
    if (!final && steps.length >= MAX_TRACE_STEPS - 1) {
      traceTruncated = true;
      return;
    }
    const activeCells = slot ? slot.cells.map(({ row, column }) => [row, column]) : [];
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: checks.map((check) => check.cell === " " ? "□" : check.cell),
      sub: checks.map((check) => `${check.expected} · ${check.state}`),
      highlight: checks.map((check, index) => check.state === "conflict" ? index : -1).filter((index) => index >= 0),
      mark: checks.map((check, index) => check.state !== "conflict" ? index : -1).filter((index) => index >= 0),
      vars: [
        { name: "word", value: word },
        { name: "slot", value: slot ? slot.text.replaceAll(" ", "□") : "—" },
        { name: "direction", value: slot?.direction ?? "—" },
        { name: "orientation", value: orientation ?? "—" },
        { name: "answer", value: final ? answer : "pending" },
      ],
      crossword2018View: {
        phase,
        board: board.map((row) => [...row]),
        rows: board.length,
        columns: board[0].length,
        word,
        slot: slot ? { ...slot, cells: slot.cells.map((cell) => ({ ...cell })) } : null,
        orientation,
        checks: checks.map((check) => ({ ...check })),
        activeCells,
        checked: checked.map((entry) => ({ ...entry })),
        slotCount: slots.length,
        traceTruncated,
        answer: final ? answer : null,
        winningSlot,
        winningOrientation,
      },
    });
  };

  emit({
    phase: "scan",
    title: bi("Tách hàng và cột tại các ô #", "Split rows and columns at # cells"),
    note: bi(`Các biên # tạo ra ${slots.length} slot tối đa; mỗi slot phải vừa khít toàn bộ word.`, `The # boundaries create ${slots.length} maximal slots; a slot must fit the entire word exactly.`),
    codeLines: [3, 11, 13, 14],
  });

  for (const slot of slots) {
    if (slot.cells.length !== word.length) {
      checked.push({ id: slot.id, direction: slot.direction, length: slot.cells.length, result: "wrong-length" });
      emit({
        phase: "length-reject",
        slot,
        title: bi(`Loại slot dài ${slot.cells.length}`, `Reject length-${slot.cells.length} slot`),
        note: bi(`Word dài ${word.length}; biên slot không được thừa hay thiếu ô.`, `The word has length ${word.length}; a slot cannot have extra or missing cells.`),
        codeLines: [5, 6, 13, 14],
      });
      continue;
    }

    for (const orientation of ["forward", "reverse"]) {
      const target = orientation === "forward" ? word : [...word].reverse().join("");
      const checks = slot.cells.map((cell, index) => ({
        index,
        cell: cell.value,
        expected: target[index],
        state: cell.value === " " ? "blank" : cell.value === target[index] ? "match" : "conflict",
      }));
      const fits = checks.every((check) => check.state !== "conflict");
      emit({
        phase: fits ? "match" : "conflict",
        slot,
        orientation,
        checks,
        title: fits
          ? bi(`Word vừa khít theo chiều ${orientation === "forward" ? "xuôi" : "ngược"}`, `The word fits in ${orientation} order`)
          : bi(`Xung đột khi thử chiều ${orientation === "forward" ? "xuôi" : "ngược"}`, `Conflict in ${orientation} order`),
        note: fits
          ? bi("Mọi ô đều trống hoặc đã chứa đúng chữ tương ứng.", "Every cell is blank or already contains the required letter.")
          : bi("Chỉ một chữ cố định khác target cũng đủ loại hướng này.", "A single fixed letter differing from the target rejects this orientation."),
        codeLines: orientation === "forward" ? [5, 6, 7, 8, 15] : [5, 6, 7, 8, 15],
      });
      if (fits) {
        answer = true;
        winningSlot = slot.id;
        winningOrientation = orientation;
        checked.push({ id: slot.id, direction: slot.direction, length: slot.cells.length, result: orientation });
        break;
      }
      if (orientation === "reverse") checked.push({ id: slot.id, direction: slot.direction, length: slot.cells.length, result: "conflict" });
    }
    if (answer) break;
  }

  emit({
    phase: answer ? "success" : "failure",
    slot: answer ? slots[winningSlot] : null,
    orientation: winningOrientation,
    title: answer ? bi("Có thể đặt word", "The word can be placed") : bi("Không có slot hợp lệ", "No valid slot exists"),
    note: answer
      ? bi("Slot thắng có đúng độ dài, đúng biên, và không xung đột ký tự theo một trong hai hướng.", "The winning slot has exact length and boundaries, with no character conflict in one orientation.")
      : bi("Mọi slot đều sai độ dài hoặc xung đột ở cả chiều xuôi và ngược.", "Every slot has the wrong length or conflicts in both forward and reverse order."),
    codeLines: answer ? [15, 16] : [18],
    final: true,
  });

  return {
    original: { board: board.map((row) => [...row]), word },
    answer,
    steps,
  };
}

module.exports = {
  2018: {
    id: 2018,
    difficulty: "medium",
    slug: "check-if-word-can-be-placed-in-crossword",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "matrix", vi: "Ma trận", en: "Matrix" },
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: bi("Check if Word Can Be Placed In Crossword", "Check if Word Can Be Placed In Crossword"),
    titleVi: bi("Kiểm tra đặt từ vào ô chữ", "Check crossword word placement"),
    statement: bi(
      "Cho bảng ô chữ gồm '#', ô trống và chữ thường. Kiểm tra word có thể lấp vừa một slot ngang hoặc dọc theo chiều xuôi hoặc ngược mà không xung đột chữ có sẵn.",
      "Given a crossword board containing '#', blanks, and lowercase letters, determine whether word exactly fills a horizontal or vertical slot in forward or reverse order without conflicting with fixed letters.",
    ),
    defaultInput: '[["#"," ","#"],[" "," ","#"],["#","c"," "]]',
    inputKind: "string",
    inputLabel: bi("Board JSON ('#', khoảng trắng, a-z)", "Board JSON ('#', blank, a-z)"),
    extraParams: [{ key: "word", type: "string", default: "abc", label: bi("word (1..14 chữ thường)", "word (1..14 lowercase letters)") }],
    debugMode: "line-by-line",
    approach: [
      bi("Xem mọi hàng và mọi cột như một line, rồi tách line tại '#'.", "Treat every row and column as a line, then split each line at '#'."),
      bi("Chỉ slot có độ dài đúng bằng word mới hợp lệ; điều này tự kiểm tra biên trước/sau.", "Only a slot whose length exactly equals the word can work; this automatically enforces both boundaries."),
      bi("Thử word và word đảo; mỗi ô phải trống hoặc trùng chữ tương ứng.", "Try the word and its reverse; every cell must be blank or match the corresponding letter."),
    ],
    complexity: {
      time: "O(m · n)",
      space: "O(m · n)",
      note: bi("Mỗi ô xuất hiện một lần trong line ngang và một lần trong line dọc.", "Each cell appears once in a horizontal line and once in a vertical line."),
    },
    code: SOURCE,
    liveArgs: (input, params = {}) => [parseBoard2018(input), parseWord2018(params)],
    builder: buildSteps2018,
  },
};
