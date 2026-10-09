"use strict";

const SOURCE_999 = Object.freeze([
  "from typing import List",
  "",
  "",
  "class Solution:",
  "    def numRookCaptures(self, board: List[List[str]]) -> int:",
  "        rook_row = rook_col = -1",
  "        for row in range(8):",
  "            for col in range(8):",
  "                if board[row][col] == \"R\":",
  "                    rook_row, rook_col = row, col",
  "",
  "        captures = 0",
  "        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))",
  "        for row_step, col_step in directions:",
  "            row, col = rook_row + row_step, rook_col + col_step",
  "            while 0 <= row < 8 and 0 <= col < 8:",
  "                piece = board[row][col]",
  "                if piece == \"B\":",
  "                    break",
  "                if piece == \"p\":",
  "                    captures += 1",
  "                    break",
  "                row += row_step",
  "                col += col_step",
  "        return captures",
]);

const DIRECTIONS_999 = Object.freeze([
  Object.freeze({ key: "down", dr: 1, dc: 0, symbol: "↓", vi: "Xuống", en: "Down" }),
  Object.freeze({ key: "up", dr: -1, dc: 0, symbol: "↑", vi: "Lên", en: "Up" }),
  Object.freeze({ key: "right", dr: 0, dc: 1, symbol: "→", vi: "Phải", en: "Right" }),
  Object.freeze({ key: "left", dr: 0, dc: -1, symbol: "←", vi: "Trái", en: "Left" }),
]);

const text999 = (vi, en) => ({ vi, en });
const key999 = (row, col) => `${row},${col}`;

function freeze999(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze999);
  return Object.freeze(value);
}

function parseBoard999(input) {
  if (typeof input !== "string") throw new TypeError("999 board must be a string.");
  const rows = input.trim().split(/[|;\n]/).map((row) => row.replace(/[\s,]/g, "")).filter(Boolean);
  if (rows.length !== 8 || rows.some((row) => row.length !== 8)) {
    throw new Error("999 board must contain exactly 8 rows of 8 cells.");
  }
  if (rows.some((row) => !/^[.RBp]{8}$/.test(row))) {
    throw new Error("999 board cells must be '.', 'R', 'B', or 'p'.");
  }
  const board = rows.map((row) => [...row]);
  const rooks = [];
  board.forEach((row, r) => row.forEach((piece, c) => {
    if (piece === "R") rooks.push([r, c]);
  }));
  if (rooks.length !== 1) throw new Error("999 board must contain exactly one rook 'R'.");
  return { board, rook: rooks[0] };
}

function buildSteps999(input) {
  const { board, rook } = parseBoard999(input);
  const steps = [];
  const scanned = [];
  const captured = [];
  const directionStates = Object.fromEntries(DIRECTIONS_999.map((direction) => [direction.key, "pending"]));
  let locatedRook = null;
  let current = null;
  let direction = null;
  let piece = null;
  let captures = 0;

  function emit(line, phase, event, title, note, options = {}) {
    const view = {
      board: board.map((row) => [...row]),
      phase,
      event,
      line,
      source: SOURCE_999[line - 1],
      rook: locatedRook ? [...locatedRook] : null,
      expectedRook: [...rook],
      current: current ? [...current] : null,
      direction: direction ? { ...direction } : null,
      piece,
      captures,
      scanned: scanned.map((cell) => ({ ...cell })),
      captured: captured.map((cell) => [...cell]),
      directionStates: { ...directionStates },
      condition: options.condition || null,
      final: Boolean(options.final),
    };
    freeze999(view);
    steps.push({
      title,
      note,
      codeLines: [line],
      vars: options.vars || [],
      final: Boolean(options.final),
      rook999View: view,
    });
  }

  emit(6, "locate", "init-rook", text999("Chưa biết vị trí xe", "Rook position is unknown"), text999("Khởi tạo tọa độ trước khi quét bàn cờ.", "Initialize the coordinates before scanning the board."));
  for (let row = 0; row < 8; row++) {
    emit(7, "locate", "scan-row", text999(`Quét hàng ${row}`, `Scan row ${row}`), text999("Tìm duy nhất một quân xe trắng R.", "Look for the single white rook R."), { vars: [{ name: "row", value: row }] });
    for (let col = 0; col < 8; col++) {
      current = [row, col];
      piece = board[row][col];
      const found = piece === "R";
      emit(9, "locate", "rook-check", text999(`Ô (${row},${col}) ${found ? "là R" : "không phải R"}`, `Cell (${row},${col}) ${found ? "is R" : "is not R"}`), text999(found ? "Đã tìm thấy tâm của bốn tia quét." : "Tiếp tục quét sang ô kế tiếp.", found ? "Found the center of the four scan rays." : "Continue to the next cell."), {
        condition: { expression: `board[${row}][${col}] == "R"`, result: found },
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "board[row][col]", value: piece }],
      });
      if (found) {
        locatedRook = [row, col];
        emit(10, "locate", "rook-found", text999(`Xe ở (${row},${col})`, `Rook at (${row},${col})`), text999("Từ đây chỉ cần nhìn theo bốn hướng thẳng.", "From here, only the four straight directions matter."));
      }
    }
  }

  current = null;
  piece = null;
  emit(12, "scan", "init-captures", text999("captures = 0", "captures = 0"), text999("Mỗi hướng bắt được nhiều nhất một tốt vì tia dừng ở quân đầu tiên.", "Each direction captures at most one pawn because the ray stops at the first piece."));
  emit(13, "scan", "directions", text999("Bốn hướng của quân xe", "The rook's four directions"), text999("Không cần duyệt đường chéo.", "Diagonal squares are irrelevant."));

  for (const nextDirection of DIRECTIONS_999) {
    direction = nextDirection;
    directionStates[direction.key] = "active";
    current = null;
    piece = null;
    emit(14, "scan", "direction-start", text999(`Nhìn ${direction.vi} ${direction.symbol}`, `Look ${direction.en.toLowerCase()} ${direction.symbol}`), text999("Bắt đầu một tia mới từ ô cạnh quân xe.", "Start a new ray at the square adjacent to the rook."), {
      vars: [{ name: "row_step", value: direction.dr }, { name: "col_step", value: direction.dc }],
    });
    let row = rook[0] + direction.dr;
    let col = rook[1] + direction.dc;
    emit(15, "scan", "first-square", text999(`Ô đầu tiên: (${row},${col})`, `First square: (${row},${col})`), text999("Di chuyển đúng một bước theo hướng đang xét.", "Move exactly one step in the current direction."));

    let stopped = false;
    while (row >= 0 && row < 8 && col >= 0 && col < 8) {
      current = [row, col];
      piece = board[row][col];
      emit(16, "scan", "bounds-check", text999(`(${row},${col}) còn trong bàn cờ`, `(${row},${col}) is on the board`), text999("Chỉ đọc quân cờ sau khi điều kiện biên đúng.", "Read the square only after the bounds check succeeds."), {
        condition: { expression: "0 <= row < 8 and 0 <= col < 8", result: true },
      });
      scanned.push({ row, col, direction: direction.key, piece });
      emit(17, "inspect", "read-piece", text999(`Đọc '${piece}' tại (${row},${col})`, `Read '${piece}' at (${row},${col})`), text999(piece === "." ? "Ô trống nên tia có thể đi tiếp." : "Đây là quân đầu tiên chặn tia quét.", piece === "." ? "The square is empty, so the ray may continue." : "This is the first piece blocking the ray."), {
        vars: [{ name: "piece", value: piece }, { name: "captures", value: captures }],
      });

      const bishop = piece === "B";
      emit(18, "inspect", "bishop-check", text999(`piece == "B" → ${bishop}`, `piece == "B" → ${bishop}`), text999(bishop ? "Tượng trắng chắn đường: hướng này không bắt được tốt." : "Không bị tượng chặn; kiểm tra tốt đen.", bishop ? "A white bishop blocks the path: no pawn can be captured this way." : "No bishop blocks the path; check for a black pawn."), {
        condition: { expression: "piece == \"B\"", result: bishop },
      });
      if (bishop) {
        directionStates[direction.key] = "blocked";
        emit(19, "stop", "bishop-stop", text999(`Dừng hướng ${direction.vi}`, `Stop ${direction.en.toLowerCase()}`), text999("Quân xe không thể đi xuyên qua tượng cùng màu.", "The rook cannot move through a bishop of the same color."));
        stopped = true;
        break;
      }

      const pawn = piece === "p";
      emit(20, "inspect", "pawn-check", text999(`piece == "p" → ${pawn}`, `piece == "p" → ${pawn}`), text999(pawn ? "Tốt đen đầu tiên trên tia này có thể bị bắt." : "Ô trống: tiếp tục đi xa hơn.", pawn ? "The first black pawn on this ray can be captured." : "Empty square: continue farther along the ray."), {
        condition: { expression: "piece == \"p\"", result: pawn },
      });
      if (pawn) {
        captures += 1;
        captured.push([row, col]);
        directionStates[direction.key] = "captured";
        emit(21, "capture", "capture", text999(`Bắt tốt tại (${row},${col}) · captures = ${captures}`, `Capture pawn at (${row},${col}) · captures = ${captures}`), text999("Đếm đúng một tốt cho hướng này.", "Count exactly one pawn for this direction."), { vars: [{ name: "captures", value: captures }] });
        emit(22, "stop", "pawn-stop", text999(`Dừng hướng ${direction.vi}`, `Stop ${direction.en.toLowerCase()}`), text999("Sau khi bắt quân đầu tiên, quân xe không thể bắt thêm quân phía sau trong cùng một nước.", "After capturing the first piece, the rook cannot capture another piece behind it in the same move."));
        stopped = true;
        break;
      }

      row += direction.dr;
      emit(23, "advance", "advance-row", text999(`row += ${direction.dr} → ${row}`, `row += ${direction.dr} → ${row}`), text999("Tiến theo thành phần hàng của vector hướng.", "Advance by the direction's row component."));
      col += direction.dc;
      emit(24, "advance", "advance-col", text999(`col += ${direction.dc} → ${col}`, `col += ${direction.dc} → ${col}`), text999("Tiến theo thành phần cột; ô mới sẽ được kiểm tra biên trước khi đọc.", "Advance by the column component; bounds are checked before reading the new square."));
    }

    if (!stopped) {
      current = null;
      piece = null;
      directionStates[direction.key] = "edge";
      emit(16, "stop", "edge-stop", text999(`Hết bàn cờ về phía ${direction.vi}`, `Reached the board edge going ${direction.en.toLowerCase()}`), text999("Không gặp tượng hay tốt trên tia này.", "No bishop or pawn was encountered on this ray."), {
        condition: { expression: "0 <= row < 8 and 0 <= col < 8", result: false },
      });
    }
  }

  current = null;
  direction = null;
  piece = null;
  emit(25, "done", "return", text999(`Trả về ${captures}`, `Return ${captures}`), text999(`Có ${captures} hướng mà quân đầu tiên nhìn thấy là tốt đen.`, `In ${captures} directions, the first visible piece is a black pawn.`), {
    final: true,
    vars: [{ name: "captures", value: captures }],
  });
  return { original: board.map((row) => [...row]), answer: captures, steps };
}

module.exports = {
  999: {
    id: 999,
    difficulty: "easy",
    slug: "available-captures-for-rook",
    category: { key: "array", vi: "Mảng / Ma trận", en: "Array / Matrix" },
    tags: [
      { key: "matrix", vi: "Ma trận", en: "Matrix" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: text999("Available Captures for Rook", "Available Captures for Rook"),
    titleVi: text999("Số tốt quân xe có thể bắt", "Available captures for a rook"),
    statement: text999(
      "Trên bàn cờ 8×8 có một xe trắng R, các tượng trắng B và tốt đen p. Đếm số tốt mà xe có thể bắt trong một nước. Nhập 8 hàng cách nhau bởi '|'.",
      "On an 8×8 board, one white rook R shares the board with white bishops B and black pawns p. Count the pawns the rook can capture in one move. Separate rows with '|'."
    ),
    defaultInput: "........|...p....|...R...p|........|........|...p....|........|........",
    inputKind: "string",
    inputLabel: text999("board 8×8 (hàng cách bởi '|'; dùng . R B p)", "8×8 board (rows separated by '|'; use . R B p)"),
    extraParams: [],
    approach: [
      text999("Tìm vị trí quân xe R, rồi tạo bốn tia theo các hướng lên, xuống, trái và phải.", "Find the rook R, then cast four rays: up, down, left, and right."),
      text999("Trên mỗi tia, bỏ qua ô trống. Gặp tượng B thì hướng đó bị chặn; gặp tốt p thì tăng đáp án và dừng tia.", "Along each ray, skip empty squares. A bishop B blocks the direction; a pawn p increments the answer and stops the ray."),
      text999("Mỗi hướng đóng góp tối đa một lần bắt vì quân xe chỉ có thể bắt quân đầu tiên trên đường đi.", "Each direction contributes at most one capture because the rook can capture only the first piece in its path."),
    ],
    complexity: {
      time: "O(8²)",
      space: "O(1)",
      note: text999("Tìm xe bằng một lượt quét 64 ô; bốn tia chỉ đi trên cùng hàng và cột.", "Locate the rook by scanning 64 squares; the four rays only traverse its row and column."),
    },
    debugMode: "line-by-line",
    code: SOURCE_999,
    liveArgs(input) {
      return [parseBoard999(input).board];
    },
    builder: buildSteps999,
  },
};
