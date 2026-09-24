const label = (vi, en) => ({ vi, en });
const DIRECTIONS = [
  { key: "H", vi: "Ngang", en: "Horizontal", dr: 0, dc: 1 },
  { key: "V", vi: "Dọc", en: "Vertical", dr: 1, dc: 0 },
  { key: "D", vi: "Chéo ↘", en: "Diagonal ↘", dr: 1, dc: 1 },
  { key: "A", vi: "Chéo ↙", en: "Anti-diagonal ↙", dr: 1, dc: -1 },
];
const TRACE_CELLS = 36;
const PREVIEW_ROWS = 12;
const PREVIEW_COLS = 12;

function parseMatrix562(input) {
  let mat = input;
  if (typeof input === "string") {
    const raw = input.trim();
    if (!raw) throw new Error("mat must be a nonempty binary matrix");
    if (raw.startsWith("[")) {
      try {
        mat = JSON.parse(raw);
      } catch (_error) {
        throw new Error("mat must be valid JSON or semicolon-separated rows");
      }
    } else {
      mat = raw.split(";").map((row) => row.split(",").map((cell) => {
        const value = cell.trim();
        return value === "0" ? 0 : value === "1" ? 1 : NaN;
      }));
    }
  }
  if (!Array.isArray(mat) || mat.length === 0 || !Array.isArray(mat[0]) || mat[0].length === 0
    || !mat.every((row) => Array.isArray(row) && row.length === mat[0].length
      && row.every((cell) => cell === 0 || cell === 1))) {
    throw new Error("mat must be a nonempty rectangular binary matrix");
  }
  if (mat.length * mat[0].length > 10000) throw new Error("mat may contain at most 10000 cells");
  return mat;
}

function buildSteps562(input) {
  const mat = parseMatrix562(input);
  const rows = mat.length;
  const cols = mat[0].length;
  const dp = Array.from({ length: rows }, () => Array.from({ length: cols }, () => [0, 0, 0, 0]));
  const steps = [];
  let best = 0;
  let bestLine = null;
  let row = null;
  let col = null;

  function record(phase, title, line, note, activeDirection = null, source = null, final = false) {
    const current = row === null || col === null ? null : [row, col];
    const lengths = current ? [...dp[row][col]] : [0, 0, 0, 0];
    const vars = [{ name: "rows", value: rows }, { name: "cols", value: cols }, { name: "best", value: best }];
    if (current) {
      vars.push({ name: "r", value: row }, { name: "c", value: col },
        { name: "mat[r][c]", value: mat[row][col] },
        { name: "dp[r][c]", value: `[${lengths.join(", ")}]` });
    }
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note, final,
      longestLine562View: {
        phase, rows, cols, current, lengths, activeDirection, source,
        best, bestLine: bestLine ? { ...bestLine, end: [...bestLine.end] } : null,
        matrix: mat.slice(0, PREVIEW_ROWS).map((cells) => cells.slice(0, PREVIEW_COLS)),
        dp: dp.slice(0, PREVIEW_ROWS).map((cells) => cells.slice(0, PREVIEW_COLS).map((counts) => [...counts])),
        shortened: rows * cols > TRACE_CELLS || rows > PREVIEW_ROWS || cols > PREVIEW_COLS,
      },
    });
  }

  record("enter", label("Vào hàm longestLine", "Enter longestLine"), 2,
    label("Đầu vào là ma trận chỉ gồm 0 và 1.", "The input is a binary matrix."));
  record("size", label(`Ma trận ${rows} × ${cols}`, `${rows} × ${cols} matrix`), 3,
    label("Duyệt từng ô theo thứ tự từ trên xuống, trái sang phải.",
      "Visit cells from top to bottom, left to right."));
  record("init", label("Tạo DP bốn hướng", "Initialize four-direction DP"), 4,
    label("Mỗi ô giữ độ dài dãy 1 kết thúc tại đây theo 4 hướng H, V, D, A.",
      "Each cell stores four lengths ending here: H, V, D, and A."));
  record("best-init", label("best = 0", "best = 0"), 5,
    label("Chưa gặp ô 1 nào nên đáp án ban đầu là 0.",
      "No one-cell has been visited, so the initial answer is 0."));

  for (let r = 0; r < rows; r++) {
    row = r;
    col = null;
    if (r * cols < TRACE_CELLS) record("row", label(`Hàng ${r}`, `Row ${r}`), 6,
      label("Bắt đầu duyệt hàng này.", "Start scanning this row."));
    for (let c = 0; c < cols; c++) {
      col = c;
      const trace = r * cols + c < TRACE_CELLS;
      if (trace) record("cell", label(`Xét ô (${r}, ${c})`, `Visit cell (${r}, ${c})`), 7,
        label("Xét ô tiếp theo trong hàng.", "Visit the next cell in the row."));
      if (trace) record("check", label(`mat[${r}][${c}] = ${mat[r][c]}`,
        `mat[${r}][${c}] = ${mat[r][c]}`), 8,
      mat[r][c] === 0
        ? label("Số 0 chặn cả bốn dãy; DP tại ô này giữ nguyên 0.",
          "A zero breaks all four runs; this cell's DP stays zero.")
        : label("Số 1 có thể nối tiếp các dãy từ ô đứng trước.",
          "A one can extend runs from predecessor cells."));
      if (mat[r][c] === 0) {
        if (trace) record("skip", label("Bỏ qua ô 0", "Skip zero cell"), 9,
          label("continue chuyển sang ô kế tiếp.", "continue moves to the next cell."));
        continue;
      }
      for (let direction = 0; direction < 4; direction++) {
        const { dr, dc, key, vi, en } = DIRECTIONS[direction];
        const previousRow = r - dr;
        const previousCol = c - dc;
        const exists = previousRow >= 0 && previousCol >= 0 && previousCol < cols;
        const previous = exists ? dp[previousRow][previousCol][direction] : 0;
        dp[r][c][direction] = previous + 1;
        if (trace) record("extend", label(`${vi}: ${previous} + 1 = ${previous + 1}`,
          `${en}: ${previous} + 1 = ${previous + 1}`), 10 + direction,
        label(exists
          ? `Lấy ${key} tại (${previousRow}, ${previousCol}), rồi cộng 1 cho ô hiện tại.`
          : `Không có ô đứng trước theo hướng ${key}; bắt đầu dãy mới dài 1.`,
        exists
          ? `Take ${key} at (${previousRow}, ${previousCol}), then add one for this cell.`
          : `No predecessor in direction ${key}; start a new run of length one.`),
        direction, exists ? { row: previousRow, col: previousCol, value: previous } : null);
      }
      const cellBest = Math.max(...dp[r][c]);
      if (cellBest > best) {
        best = cellBest;
        bestLine = { direction: dp[r][c].indexOf(cellBest), end: [r, c], length: cellBest };
      }
      if (trace) record("best", label(`best = ${best}`, `best = ${best}`), 14,
        label("So sánh cả bốn dãy kết thúc tại ô này với kỷ lục toàn cục.",
          "Compare all four runs ending here with the global best."));
    }
  }
  row = null;
  col = null;
  record("done", label(`Trả về ${best}`, `Return ${best}`), 15,
    label("Đã xét mọi ô và cả bốn hướng.", "Every cell and all four directions have been checked."),
    null, null, true);
  return { original: mat, answer: best, steps };
}

module.exports = {
  562: {
    id: 562,
    difficulty: "medium",
    slug: "longest-line-of-consecutive-one-in-matrix",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "matrix", vi: "Ma trận", en: "Matrix" },
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    ],
    title: label("Longest Line of Consecutive One in Matrix", "Longest Line of Consecutive One in Matrix"),
    titleVi: label("Dãy số 1 dài nhất trong ma trận", "Longest line of ones in a matrix"),
    statement: label(
      "Cho ma trận 0/1. Tìm độ dài dãy số 1 liên tiếp dài nhất theo hàng, cột, đường chéo ↘ hoặc đường chéo ↙.",
      "Given a binary matrix, return the longest consecutive line of ones horizontally, vertically, diagonally, or anti-diagonally."
    ),
    defaultInput: "[[0,1,1,0],[0,1,1,0],[0,0,0,1]]",
    inputKind: "string",
    inputLabel: label("mat (JSON hoặc hàng cách ;)", "mat (JSON or ; between rows)"),
    extraParams: [],
    approach: [
      label("dp[r][c] lưu bốn độ dài dãy 1 kết thúc tại ô (r,c): ngang H, dọc V, chéo D, chéo ngược A.",
        "dp[r][c] stores four one-run lengths ending at (r,c): horizontal H, vertical V, diagonal D, anti-diagonal A."),
      label("Nếu ô là 0, cả bốn giá trị bằng 0. Nếu là 1, mỗi hướng lấy giá trị từ ô đứng trước rồi cộng 1.",
        "At a zero, all four values stay zero. At a one, extend each direction's predecessor by one."),
      label("Sau mỗi ô 1, cập nhật độ dài lớn nhất trong bốn hướng.",
        "After each one-cell, update the maximum of the four directions."),
    ],
    complexity: { time: "O(mn)", space: "O(mn)",
      note: label("m hàng, n cột; mỗi ô tính đúng bốn trạng thái DP.",
        "m rows and n columns; each cell computes exactly four DP states.") },
    debugMode: "line-by-line",
    code: [
      "class Solution:",
      "    def longestLine(self, mat):",
      "        rows, cols = len(mat), len(mat[0])",
      "        dp = [[[0] * 4 for _ in range(cols)] for _ in range(rows)]",
      "        best = 0",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if mat[r][c] == 0:",
      "                    continue",
      "                dp[r][c][0] = 1 + (dp[r][c-1][0] if c > 0 else 0)",
      "                dp[r][c][1] = 1 + (dp[r-1][c][1] if r > 0 else 0)",
      "                dp[r][c][2] = 1 + (dp[r-1][c-1][2] if r > 0 and c > 0 else 0)",
      "                dp[r][c][3] = 1 + (dp[r-1][c+1][3] if r > 0 and c+1 < cols else 0)",
      "                best = max(best, *dp[r][c])",
      "        return best",
    ],
    builder: buildSteps562,
    liveArgs(input) { return [parseMatrix562(input)]; },
  },
};
