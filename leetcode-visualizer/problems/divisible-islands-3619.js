"use strict";

const { bi, integer, gridInput, pictureTrace } = require("./picture-study-shared");
const code = ["from collections import deque", "class Solution:", "    def countIslands(self, grid, k):", "        m, n = len(grid), len(grid[0])",
  "        seen = set()", "        answer = 0", "        for r in range(m):", "            for c in range(n):", "                if grid[r][c] == 0 or (r, c) in seen:", "                    continue",
  "                queue = deque([(r, c)])", "                seen.add((r, c))", "                total = 0", "                while queue:", "                    x, y = queue.popleft()", "                    total += grid[x][y]",
  "                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):", "                        nx, ny = x + dx, y + dy",
  "                        if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] > 0 and (nx, ny) not in seen:",
  "                            seen.add((nx, ny))", "                            queue.append((nx, ny))", "                if total % k == 0:", "                    answer += 1", "        return answer"];
function parse(input, params = {}) { return { grid: gridInput(input), k: integer(params.k ?? 5, 1, 1000000, "k") }; }
function builder(input, params) {
  const { grid, k } = parse(input, params), m = grid.length, n = grid[0].length, seen = new Set(), queue = [], owners = {}, islands = [], t = pictureTrace(3619, code, ["k", "cell", "total", "total % k", "len(queue)", "answer", "(nx, ny)", "len(seen)"]);
  let total, answer = 0, current = null, neighbor = null, island = -1, sumReady = false, seenReady = false, answerReady = false;
  const emit = (line, phase, action = null, final = false) => t.emit(line, phase,
    { k, cell: current ? `(${current.join(",")})` : null, total, "total % k": sumReady ? total % k : null, "len(queue)": island >= 0 ? queue.length : null, answer: answerReady ? answer : null,
      "(nx, ny)": neighbor ? `(${neighbor.join(",")})` : null, "len(seen)": seenReady ? seen.size : null },
    { grid, k, seen: [...seen], queue, owners, islands, island, current, neighbor, total, answer, action }, final);
  emit(4, "grid"); seenReady = true; emit(5, "seen = ∅"); answerReady = true; emit(6, "answer = 0");
  for (let r = 0; r < m; r++) {
    emit(7, "r");
    for (let c = 0; c < n; c++) {
      current = [r, c]; emit(8, "c");
      const key = `${r},${c}`, skip = !grid[r][c] || seen.has(key); emit(9, "land ?", { kind: "skip", pass: skip });
      if (skip) { emit(10, "↷"); continue; }
      island++; islands.push({ cells: [], total: 0, complete: false, accepted: false });
      queue.push([r, c]); emit(11, "queue ← cell"); seen.add(key); owners[key] = island; islands[island].cells.push([r, c]); emit(12, "seen ✓");
      total = 0; sumReady = true; emit(13, "Σ = 0");
      while (queue.length) {
        emit(14, "queue ≠ ∅"); current = queue.shift(); emit(15, "queue → cell");
        const [x, y] = current; total += grid[x][y]; islands[island].total = total; emit(16, "Σ + cell", { kind: "add", value: grid[x][y] });
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          emit(17, "↓ ↑ → ←"); const nx = x + dx, ny = y + dy; neighbor = [nx, ny]; emit(18, "neighbor", { kind: "neighbor", cell: [nx, ny] });
          const pass = nx >= 0 && nx < m && ny >= 0 && ny < n && grid[nx][ny] > 0 && !seen.has(`${nx},${ny}`);
          emit(19, "land ∧ unseen ?", { kind: "neighbor", cell: [nx, ny], pass });
          if (pass) { seen.add(`${nx},${ny}`); owners[`${nx},${ny}`] = island; islands[island].cells.push([nx, ny]); emit(20, "seen ✓", { kind: "neighbor", cell: [nx, ny], pass }); queue.push([nx, ny]); emit(21, "queue ← neighbor", { kind: "enqueue", cell: [nx, ny] }); }
        }
        emit(17, "✓");
      }
      emit(14, "queue = ∅"); islands[island].complete = true; islands[island].accepted = total % k === 0;
      emit(22, "Σ % k = 0 ?", { kind: "test", pass: total % k === 0 });
      if (total % k === 0) { answer++; emit(23, "answer + 1", { kind: "accept" }); }
    }
    emit(8, "✓");
  }
  emit(7, "✓"); current = null; emit(24, "✓", null, true);
  return { original: grid, answer, steps: t.steps };
}
module.exports = { 3619: { id: 3619, difficulty: "medium", slug: "count-islands-with-total-value-divisible-by-k", category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  title: bi("Count Islands With Total Value Divisible by K"), titleVi: bi("Đếm đảo có tổng chia hết cho k", "Count islands divisible by k"),
  statement: bi("Các ô dương nối theo 4 hướng tạo thành đảo. Đếm đảo có tổng giá trị chia hết cho k.", "Positive cells connected in four directions form an island. Count islands whose total is divisible by k."),
  defaultInput: "0,2,1,0,0;0,5,0,0,5;0,0,1,0,0;0,1,4,7,0;0,2,0,0,8", inputKind: "string", inputLabel: bi("grid · hàng ngăn bằng ; · tối đa 10×10", "grid · rows separated by ; · up to 10×10"),
  extraParams: [{ key: "k", type: "number", label: bi("k"), default: 5, min: 1, max: 1000000 }],
  approach: [bi("BFS tô từng đảo; đánh dấu seen khi đưa ô vào queue.", "BFS paints each island; mark cells seen when enqueuing."), bi("Cộng các ô → kiểm tra total % k.", "Sum the cells → check total % k.")],
  complexity: { time: "O(mn)", space: "O(mn)", note: bi("Mỗi ô vào queue tối đa một lần.", "Each cell enters the queue at most once.") },
  code, builder, debugMode: "line-by-line", liveArgs: (input, params) => { const p = parse(input, params); return [p.grid, p.k]; } } };
