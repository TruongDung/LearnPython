"use strict";

const { bi, integer, gridInput, heapPop, heapPush, heapify, pictureTrace } = require("./picture-study-shared");
const base = require("./heap")[378];
const code = ["class Solution:", "    def kthSmallest(self, matrix, k):", "        import heapq", "        n = len(matrix)",
  "        heap = [(matrix[r][0], r, 0) for r in range(n)]", "        heapq.heapify(heap)", "        for rank in range(1, k + 1):",
  "            val, r, c = heapq.heappop(heap)", "            if c + 1 < n:", "                heapq.heappush(heap, (matrix[r][c+1], r, c+1))", "        return val"];
function parse(input, params = {}) {
  const matrix = gridInput(input, { square: true, min: -1000000000, max: 1000000000 });
  matrix.forEach((row, r) => row.forEach((value, c) => {
    if (c && value < row[c - 1] || r && value < matrix[r - 1][c]) throw new RangeError("#378: hàng và cột phải tăng dần / rows and columns must be sorted.");
  }));
  return { matrix, k: integer(params.k ?? 8, 1, matrix.length ** 2, "k") };
}
function builder(input, params) {
  const { matrix, k } = parse(input, params), n = matrix.length, heap = [], taken = [], t = pictureTrace(378, code, ["k", "rank", "val", "r", "c", "len(heap)"]);
  let rank, val, r, c, ready = false;
  const emit = (line, phase, action = null, final = false) => t.emit(line, phase,
    { k, rank, val, r, c, "len(heap)": ready ? heap.length : null }, { matrix, k, heap, heapReady: ready, taken, action, cursor: r === undefined ? null : [r, c], rank }, final);
  emit(4, "n");
  for (let row = 0; row < n; row++) heap.push([matrix[row][0], row, 0]);
  ready = true; emit(5, "matrix → heap"); heapify(heap); emit(6, "heapify");
  for (rank = 1; rank <= k; rank++) {
    emit(7, "rank"); [val, r, c] = heapPop(heap); taken.push({ val, r, c }); emit(8, "heap → result", { kind: "pop", val, r, c });
    emit(9, "→ ?", { kind: "check", pass: c + 1 < n, r, c });
    if (c + 1 < n) { const next = [matrix[r][c + 1], r, c + 1]; heapPush(heap, next); emit(10, "matrix → heap", { kind: "push", val: next[0], r, c: c + 1 }); }
  }
  rank = k; emit(7, "✓"); emit(11, "✓", null, true);
  return { original: matrix, answer: val, steps: t.steps };
}
module.exports = { 378: { ...base, code, builder, debugMode: "line-by-line", liveArgs: (input, params) => { const p = parse(input, params); return [p.matrix, p.k]; },
  statement: bi("Tìm phần tử nhỏ thứ k trong ma trận có hàng và cột tăng dần.", "Find the kth smallest value in a matrix with sorted rows and columns."),
  inputLabel: bi("Ma trận · hàng ngăn bằng ; · tối đa 10×10", "Matrix · rows separated by ; · up to 10×10"),
  complexity: { time: "O(n + k log(n+1))", space: "O(n)", note: bi("Mỗi hàng giữ một ứng viên trong heap.", "One candidate per row in the heap.") } } };
