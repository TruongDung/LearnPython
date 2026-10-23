"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class Solution:",
  "    def isPrintable(self, grid):",
  "        h, w = len(grid), len(grid[0])",
  "        boxes = {}",
  "        for r in range(h):",
  "            for c in range(w):",
  "                color = grid[r][c]",
  "                if color not in boxes: boxes[color] = [r, r, c, c]",
  "                boxes[color] = expand(boxes[color], r, c)",
  "        graph = {color: set() for color in boxes}; indegree = {color: 0 for color in boxes}",
  "        for color, (top, bottom, left, right) in boxes.items():",
  "            for r in range(top, bottom + 1):",
  "                for c in range(left, right + 1):",
  "                    other = grid[r][c]",
  "                    if other != color:",
  "                        graph[other].add(color)  # other must print first",
  "                        indegree[color] += 1",
  "        queue = [c for c in boxes if indegree[c] == 0]",
  "        order = []",
  "        while queue:",
  "            color = queue.pop(0); order.append(color)",
  "            for nxt in graph[color]:",
  "                indegree[nxt] -= 1",
  "                if indegree[nxt] == 0: queue.append(nxt)",
  "        return len(order) == len(boxes)",
];

function parseGrid(input) {
  let grid;
  if (Array.isArray(input)) grid = input.map((row) => Array.isArray(row) ? row.map(Number) : []);
  else if (input && typeof input === "object") grid = input.grid;
  else if (typeof input === "string") {
    const source = input.trim();
    try { if (source.startsWith("[")) grid = JSON.parse(source); } catch (_) { /* parse the compact row format below */ }
    if (!grid) grid = source.split(/[;\n]+/).filter(Boolean).map((row) => row.split(/[\s,]+/).filter(Boolean).map(Number));
  }
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 8
    || grid.some((row) => !Array.isArray(row) || row.length !== grid[0].length || row.some((color) => !Number.isInteger(color) || color < 1 || color > 60))
    || new Set(grid.flat()).size > 10) {
    throw new RangeError("#1591: Enter a 1–8 × 1–8 grid, use colors 1–60, and use at most 10 different colors (rows separated by ;, cells by ,).");
  }
  return grid.map((row) => [...row]);
}

function buildSteps(input) {
  const grid = parseGrid(input), h = grid.length, w = grid[0].length;
  const boxes = {}, graph = {}, indegree = {}, edges = [], steps = [];
  let phase = "start", activeColor = null, activeCell = null, queue = [], order = [], answer = null;
  function emit(line, titleVi, titleEn, final = false) {
    steps.push({
      title: bi(titleVi, titleEn), note: bi("", ""), arr: [], highlight: activeCell ? [activeCell.r * w + activeCell.c] : [], mark: [], codeLines: [line], final,
      vars: [{ name: "màu", value: activeColor ?? "—" }, { name: "đợi", value: queue.join(" → ") || "∅" }, { name: "thứ tự", value: order.join(" → ") || "∅" }],
      strangePrinterII1591View: { grid: grid.map((row) => [...row]), h, w, boxes: JSON.parse(JSON.stringify(boxes)), graph: Object.fromEntries(Object.entries(graph).map(([c, next]) => [c, [...next]])), indegree: { ...indegree }, edges: edges.map((edge) => ({ ...edge })), phase, activeColor, activeCell: activeCell ? { ...activeCell } : null, queue: [...queue], order: [...order], answer },
    });
  }
  emit(1, "Bắt đầu", "Start"); emit(2, "Nhìn bảng màu cần tạo", "Read the target picture");
  emit(3, `Bảng ${h} × ${w}`, `${h} × ${w} grid`); emit(4, "Mỗi màu cần một khung", "Find one box per color");
  for (let r = 0; r < h; r++) {
    emit(5, `Hàng ${r}`, `Row ${r}`);
    for (let c = 0; c < w; c++) {
      const color = grid[r][c]; activeColor = color; activeCell = { r, c }; emit(6, `Ô (${r}, ${c})`, `Cell (${r}, ${c})`);
      emit(7, `Màu ${color}`, `Color ${color}`);
      if (!boxes[color]) { boxes[color] = { top: r, bottom: r, left: c, right: c }; emit(8, `Tạo khung màu ${color}`, `Create color ${color} box`); }
      const box = boxes[color]; box.top = Math.min(box.top, r); box.bottom = Math.max(box.bottom, r); box.left = Math.min(box.left, c); box.right = Math.max(box.right, c);
      emit(9, `Nới khung ${color}`, `Expand color ${color} box`);
    }
  }
  activeCell = null; activeColor = null;
  const colors = Object.keys(boxes).map(Number).sort((a, b) => a - b);
  for (const color of colors) { graph[color] = []; indegree[color] = 0; }
  emit(10, "Chuẩn bị mũi tên phụ thuộc", "Prepare dependency arrows");
  for (const color of colors) {
    activeColor = color; const box = boxes[color]; emit(11, `Soi khung màu ${color}`, `Inspect color ${color} box`);
    for (let r = box.top; r <= box.bottom; r++) {
      activeCell = { r, c: box.left }; emit(12, `Hàng ${r} trong khung`, `Row ${r} in box`);
      for (let c = box.left; c <= box.right; c++) {
        activeCell = { r, c }; emit(13, `Ô (${r}, ${c})`, `Cell (${r}, ${c})`);
        const other = grid[r][c]; emit(14, `Ô này là màu ${other}`, `Cell has color ${other}`);
        if (other !== color) {
          emit(15, `${other} phải in trước ${color}`, `${other} must print before ${color}`);
          if (!graph[other].includes(color)) { graph[other].push(color); indegree[color]++; edges.push({ from: other, to: color, status: "pending" }); emit(16, `Mũi tên ${other} → ${color}`, `Arrow ${other} → ${color}`); emit(17, `Bậc vào ${color}: ${indegree[color]}`, `Incoming ${color}: ${indegree[color]}`); }
        }
      }
    }
  }
  activeCell = null; activeColor = null;
  queue = colors.filter((color) => indegree[color] === 0); order = []; emit(18, "Màu không chờ ai vào hàng", "Queue colors with no prerequisites"); emit(19, "Thứ tự in đang rỗng", "Start empty print order");
  while (queue.length) {
    emit(20, "Còn màu sẵn sàng", "Ready colors remain");
    activeColor = queue.shift(); order.push(activeColor); emit(21, `In màu ${activeColor}`, `Print color ${activeColor}`);
    for (const next of graph[activeColor]) {
      emit(22, `Theo mũi tên tới ${next}`, `Follow arrow to ${next}`);
      indegree[next]--; const edge = edges.find((item) => item.from === activeColor && item.to === next); if (edge) edge.status = "done";
      emit(23, `Bậc vào ${next}: ${indegree[next]}`, `Incoming ${next}: ${indegree[next]}`);
      if (indegree[next] === 0) { queue.push(next); emit(24, `Màu ${next} sẵn sàng`, `Color ${next} is ready`); }
    }
  }
  answer = order.length === colors.length; activeColor = null; emit(25, answer ? "Đã in được mọi màu ✓" : "Còn vòng phụ thuộc ✕", answer ? "Every color can be printed ✓" : "Dependency cycle remains ✕", true);
  return { original: grid, answer, steps };
}

module.exports = { 1591: {
  id: 1591, slug: "strange-printer-ii", difficulty: "hard", category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  tags: [{ key: "graph", vi: "Đồ thị", en: "Graph" }, { key: "topological-sort", vi: "Sắp xếp topo", en: "Topological Sort" }],
  title: bi("Strange Printer II", "Strange Printer II"), titleVi: bi("Máy in lạ II", "Strange Printer II"),
  statement: bi("Mỗi lượt tô một khung chữ nhật bằng một màu. Có thể tạo ra bảng màu này không?", "Each turn paints one color in a rectangle. Can the target picture be printed?"),
  defaultInput: "1,1,1,1;1,2,2,1;1,2,2,1", inputKind: "string", inputLabel: bi("bảng màu · hàng cách nhau ;", "color grid · rows separated by ;"),
  debugMode: "line-by-line", approach: [bi("Tìm khung nhỏ nhất của mỗi màu.", "Find the smallest box for every color."), bi("Nếu khung màu A che ô màu B, thì B phải in trước A.", "If A's box covers a B cell, print B before A."), bi("Chu trình nghĩa là không có thứ tự in hợp lệ.", "A cycle means no valid print order exists.")],
  complexity: { time: "O(H × W + C²)", space: "O(C²)", note: bi("Giới hạn minh họa: 8×8, tối đa 10 màu.", "Visualization limit: 8×8, up to 10 colors.") },
  code: CODE, builder: buildSteps, liveArgs: (input) => [parseGrid(input)],
} };
