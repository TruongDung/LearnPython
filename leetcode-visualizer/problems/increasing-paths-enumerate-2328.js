"use strict";
const bi = (vi, en) => ({ vi, en });
const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const SOURCE = [
  "class Solution:",
  "    def countPaths(self, grid: List[List[int]]) -> int:",
  "        MOD = 10**9 + 7",
  "        rows, cols = len(grid), len(grid[0])",
  "",
  "        if rows * cols > 36:",
  "            raise ValueError(\"Approach 3 supports at most 36 cells.\")",
  "",
  "        paths = []",
  "        path = []",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "",
  "        def dfs(r, c):",
  "            path.append((r, c))",
  "            paths.append(path.copy())",
  "            if len(paths) > 5000:",
  "                raise ValueError(\"More than 5000 paths; use approach 1 or 2.\")",
  "",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if (0 <= nr < rows and",
  "                    0 <= nc < cols and",
  "                    grid[nr][nc] > grid[r][c]):",
  "                    dfs(nr, nc)",
  "",
  "            path.pop()",
  "",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                dfs(r, c)",
  "",
  "        groups = {}",
  "        for cells in paths:",
  "            values = [grid[r][c] for r, c in cells]",
  "            groups.setdefault(len(values), []).append(values)",
  "",
  "        for length in sorted(groups):",
  "            formatted = \", \".join(",
  "                \"[\" + \" -> \".join(map(str, values)) + \"]\"",
  "                for values in groups[length]",
  "            )",
  "            print(f\"Paths with length {length}: {formatted}.\")",
  "",
  "        return len(paths) % MOD"
];
const line = text => SOURCE.indexOf(text) + 1;
const LINES = {
  mod: line("        MOD = 10**9 + 7"),
  dimensions: line("        rows, cols = len(grid), len(grid[0])"),
  limit: line("        if rows * cols > 36:"),
  paths: line("        paths = []"), path: line("        path = []"),
  directions: line("        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]"),
  define: line("        def dfs(r, c):"),
  append: line("            path.append((r, c))"), record: line("            paths.append(path.copy())"),
  pathLimit: line("            if len(paths) > 5000:"),
  direction: line("            for dr, dc in directions:"),
  neighbor: line("                nr, nc = r + dr, c + dc"),
  condition: line("                if (0 <= nr < rows and"),
  call: line("                    dfs(nr, nc)"), pop: line("            path.pop()"),
  row: line("        for r in range(rows):"), root: line("            for c in range(cols):"), rootCall: line("                dfs(r, c)"),
  groups: line("        groups = {}"), groupCell: line("        for cells in paths:"),
  values: line("            values = [grid[r][c] for r, c in cells]"), groupAdd: line("            groups.setdefault(len(values), []).append(values)"),
  length: line("        for length in sorted(groups):"), format: line('            formatted = ", ".join('),
  print: line('            print(f"Paths with length {length}: {formatted}.")'),
  done: line("        return len(paths) % MOD"),
};
function buildSteps(grid) {
  const rows = grid.length, cols = grid[0].length;
  if (rows * cols > 36) throw new Error("2328 · Cách 3: tối đa 36 ô để liệt kê đầy đủ. Dùng cách 1 hoặc 2 cho grid lớn / Approach 3: at most 36 cells for full enumeration; use approach 1 or 2 for larger grids.");
  const steps = [], paths = [], path = [], counts = new Map(), groups = new Map(), printed = [];
  let current = null, root = null, neighbor = null, direction = null, processed = 0, omitted = 0;
  const cellsOf = cells => cells.map(([r, c]) => ({ r, c, value: grid[r][c] }));
  function emit(sourceLine, phase, title, note, extra = {}) {
    if (steps.length >= 600 && phase !== "done") { omitted++; return; }
    const focus = current || [0, 0], rowStart = Math.max(0, Math.min(focus[0] - 2, rows - 6)), colStart = Math.max(0, Math.min(focus[1] - 2, cols - 6));
    const window = Array.from({ length: Math.min(6, rows - rowStart) }, (_, i) => Array.from({ length: Math.min(6, cols - colStart) }, (_, j) => {
      const r = rowStart + i, c = colStart + j;
      return { r, c, value: grid[r][c], onPath: path.some(cell => cell[0] === r && cell[1] === c) };
    }));
    steps.push({ arr: [], codeBlock: 3, codeLines: extra.codeLines || [sourceLine], title, note, final: phase === "done",
      vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }, { name: "len(paths)", value: paths.length },
        { name: "path", value: path.map(cell => "(" + cell.join(",") + ")").join(" → ") || "[]" },
        ...(current ? [{ name: "r, c", value: current.join(", ") }] : [])],
      increasingPaths2328View: { method: 3, rows, cols, total: rows * cols, window, current: current ? [...current] : null,
        root: root ? [...root] : null, neighbor: neighbor ? [...neighbor] : null, direction, phase, processed, omitted,
        condition: extra.condition ?? null, path: cellsOf(path), lastPath: paths.length ? cellsOf(paths.at(-1)) : [],
        count: paths.length, counts: [...counts].sort((a, b) => a[0] - b[0]).map(([length, count]) => ({ length, count })),
        groups: (phase === "done" ? [...groups.keys()].sort((a, b) => a - b) : printed).map(length => ({ length, paths: groups.get(length).map(cellsOf) })),
        answer: phase === "done" ? paths.length % 1000000007 : null },
    });
  }
  emit(LINES.mod, "mod", bi("MOD = 1,000,000,007", "MOD = 1,000,000,007"), bi("Liệt kê mọi đường thực tế; chỉ lấy modulo cho kết quả trả về.", "Enumerate every actual path; only the return value is reduced modulo MOD."));
  emit(LINES.dimensions, "dimensions", bi(`rows = ${rows}, cols = ${cols}`, `rows = ${rows}, cols = ${cols}`), bi("Đường được phân biệt bằng các tọa độ, kể cả khi có cùng giá trị.", "Paths differ by coordinates even when their values match."));
  emit(LINES.limit, "limit", bi("Grid phù hợp để in đầy đủ", "Grid supports full enumeration"), bi("Cách 3 giới hạn 36 ô và 5000 đường. Nếu vượt giới hạn sẽ báo lỗi, không in danh sách thiếu.", "Approach 3 allows 36 cells and 5000 paths. Exceeding the limit reports an error instead of printing a partial list."));
  emit(LINES.paths, "paths-init", bi("paths = []", "paths = []"), bi("paths giữ bản sao riêng của từng đường đã tìm được.", "paths holds a separate copy of each discovered path."));
  emit(LINES.path, "path-init", bi("path = []", "path = []"), bi("path là nhánh DFS hiện tại, thay đổi khi thêm hoặc bỏ ô.", "path is the current DFS branch, updated when cells are appended or removed."));
  emit(LINES.directions, "directions", bi("Đi bốn hướng", "Move in four directions"), bi("Không đi chéo, chỉ nối tới giá trị lớn hơn.", "No diagonals; only extend to a larger value."));
  emit(LINES.define, "define", bi("DFS + backtracking, không gộp các đường", "DFS + backtracking, keeping paths separate"), bi("Cùng ô cuối vẫn có thể thuộc nhiều đường khác nhau; giữ nguyên nhánh của từng đường.", "The same endpoint can belong to distinct paths; preserve the branch of each path."));
  function dfs(r, c) {
    current = [r, c]; neighbor = null; direction = null;
    path.push([r, c]);
    emit(LINES.append, "append", bi(`Thêm (${r},${c}) vào path`, `Append (${r},${c}) to path`), bi("Đường tăng có thể dừng ngay tại đây, không cần đợi tới ô không còn hướng đi.", "An increasing path may end here; it does not have to reach a cell with no outgoing move."));
    paths.push(path.map(cell => [...cell]));
    if (paths.length > 5000) throw new Error("2328 · Cách 3: hơn 5000 đường. Dùng cách 1 hoặc 2 để đếm / Approach 3: more than 5000 paths; use approach 1 or 2 to count.");
    counts.set(path.length, (counts.get(path.length) || 0) + 1);
    emit(LINES.record, "record", bi(`Lưu đường #${paths.length}, độ dài ${path.length}`, `Save path #${paths.length}, length ${path.length}`), bi("path.copy() giữ nguyên đường này khi path thay đổi về sau. Lưu mọi prefix, gồm cả đường dài 1.", "path.copy() preserves this path when path changes later. Save every prefix, including length-1 paths."));
    emit(LINES.pathLimit, "path-limit", bi(`${paths.length} ≤ 5000`, `${paths.length} ≤ 5000`), bi("Tiếp tục liệt kê đầy đủ.", "Continue complete enumeration."));
    for (let d = 0; d < 4; d++) {
      current = [r, c]; direction = d; neighbor = null;
      const [dr, dc] = DIRECTIONS[d];
      emit(LINES.direction, "direction", bi(`Xét hướng (${dr},${dc})`, `Check direction (${dr},${dc})`), bi("Thử kéo dài nhánh hiện tại.", "Try extending the current branch."));
      const nr = r + dr, nc = c + dc; neighbor = [nr, nc];
      emit(LINES.neighbor, "neighbor", bi(`Ô kề (${nr},${nc})`, `Neighbor (${nr},${nc})`), bi("Kiểm tra biên và giá trị lớn hơn.", "Check bounds and a strictly larger value."));
      const rowValid = nr >= 0 && nr < rows, colValid = nc >= 0 && nc < cols;
      const valid = rowValid && colValid && grid[nr][nc] > grid[r][c];
      const note = !rowValid || !colValid ? bi("Ngoài grid → bỏ qua.", "Outside the grid → skip.")
        : valid ? bi(`${grid[nr][nc]} > ${grid[r][c]} → được nối.`, `${grid[nr][nc]} > ${grid[r][c]} → may extend.`)
        : bi(`${grid[nr][nc]} ≤ ${grid[r][c]} → bỏ qua.`, `${grid[nr][nc]} ≤ ${grid[r][c]} → skip.`);
      emit(LINES.condition, valid ? "accept" : "reject", valid ? bi("Kéo dài đường tăng", "Extend the increasing path") : bi("Không nối tới ô này", "Do not extend to this cell"), note,
        { condition: valid, codeLines: !rowValid ? [LINES.condition] : !colValid ? [LINES.condition, LINES.condition + 1] : [LINES.condition, LINES.condition + 1, LINES.condition + 2] });
      if (valid) {
        emit(LINES.call, "call", bi(`Gọi dfs(${nr},${nc})`, `Call dfs(${nr},${nc})`), bi("Giữ nguyên các ô cha trong path và thêm ô con.", "Keep the parent cells in path and append the child."));
        dfs(nr, nc); current = [r, c]; neighbor = [nr, nc]; direction = d;
      }
    }
    path.pop(); neighbor = null; direction = null;
    emit(LINES.pop, "pop", bi(`Bỏ (${r},${c}) khỏi path`, `Remove (${r},${c}) from path`), bi("Backtracking khôi phục nhánh cha để thử hướng khác. Các bản sao trong paths vẫn còn nguyên.", "Backtracking restores the parent's branch for other directions. Copies in paths stay unchanged."));
  }
  for (let r = 0; r < rows; r++) {
    emit(LINES.row, "row", bi(`Duyệt hàng ${r}`, `Scan row ${r}`), bi("Mỗi ô đều được thử làm điểm bắt đầu.", "Try every cell as a starting point."));
    for (let c = 0; c < cols; c++) {
      root = [r, c]; current = [r, c];
      emit(LINES.root, "root", bi(`Bắt đầu từ (${r},${c})`, `Start at (${r},${c})`), bi("path rỗng trước mỗi ô gốc.", "path is empty before each root."));
      emit(LINES.rootCall, "root-call", bi(`Gọi dfs(${r},${c})`, `Call dfs(${r},${c})`), bi("Lưu mọi đường bắt đầu ở ô gốc này.", "Save every path starting at this root."));
      dfs(r, c); processed++;
    }
  }
  root = null; current = null;
  emit(LINES.groups, "groups-init", bi("Nhóm đường theo độ dài", "Group paths by length"), bi("Độ dài là số ô đã đi qua, không phải số bước nối.", "Length is the number of visited cells, not the number of moves."));
  for (const cells of paths) {
    emit(LINES.groupCell, "group-path", bi(`Xét đường dài ${cells.length}`, `Read a length-${cells.length} path`), bi("Mỗi đường vẫn giữ riêng dù có cùng dãy giá trị.", "Keep each path separate even when value sequences match."));
    emit(LINES.values, "values", bi("Chuyển tọa độ thành giá trị", "Convert coordinates to values"), bi("Tọa độ vẫn được giữ trong visualization để phân biệt các đường trùng giá trị.", "The visualization retains coordinates to distinguish identical value sequences."));
    if (!groups.has(cells.length)) groups.set(cells.length, []);
    groups.get(cells.length).push(cells);
    emit(LINES.groupAdd, "group-add", bi(`Thêm vào nhóm độ dài ${cells.length}`, `Add to length-${cells.length} group`), bi("Không dùng set để loại trùng giá trị.", "Do not deduplicate paths by their values."));
  }
  for (const length of [...groups.keys()].sort((a, b) => a - b)) {
    emit(LINES.length, "length", bi(`In nhóm độ dài ${length}`, `Print length-${length} group`), bi("In theo thứ tự độ dài tăng dần.", "Print in ascending length order."));
    emit(LINES.format, "format", bi("Ghép các giá trị bằng →", "Join values with →"), bi("Mỗi đường được đặt trong dấu ngoặc vuông.", "Put each path inside square brackets."), { codeLines: [LINES.format, LINES.format + 1, LINES.format + 2, LINES.format + 3] });
    printed.push(length);
    emit(LINES.print, "print", bi(`Đã in ${groups.get(length).length} đường dài ${length}`, `Printed ${groups.get(length).length} length-${length} paths`), bi("Nhóm này chứa đầy đủ các đường có độ dài đó.", "This group contains every path of this length."));
  }
  emit(LINES.done, "done", bi(`Đã in đủ ${paths.length} đường`, `Printed all ${paths.length} paths`), bi("Danh sách đầy đủ nằm dưới, nhóm theo độ dài. Hai đường cùng giá trị có tọa độ khác nhau vẫn được in riêng.", "The complete list below is grouped by length. Equal value sequences with different coordinates are printed separately."));
  return { original: grid, answer: paths.length % 1000000007, allPaths: paths.map(cellsOf), steps };
}
module.exports = { SOURCE, buildSteps };

