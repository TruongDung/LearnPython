"use strict";

const base = require("./heap")[215];
const bi = (vi, en) => ({ vi, en });
function parse(input, params = {}) {
  const text = String(input).trim();
  let nums;
  try { nums = text.startsWith("[") ? JSON.parse(text) : text.split(",").map(s => s.trim() === "" ? NaN : Number(s)); }
  catch (_) { throw new Error("nums: nhập các số nguyên, ví dụ 3,2,1,5,6,4."); }
  if (!Array.isArray(nums) || !nums.length || nums.length > 100000 || !nums.every(n => Number.isInteger(n) && n >= -10000 && n <= 10000)) {
    throw new Error("nums: 1–100000 số nguyên trong [-10000, 10000].");
  }
  const k = params.k === undefined ? 2 : Number(params.k);
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error("k phải là số nguyên từ 1 đến nums.length.");
  return { nums, k };
}

// Match heapq, including the right-child choice when both children are equal.
function push(heap, item) {
  let pos = heap.length;
  heap.push(item);
  while (pos > 0) {
    const parent = (pos - 1) >> 1;
    if (item.value >= heap[parent].value) break;
    heap[pos] = heap[parent]; pos = parent;
  }
  heap[pos] = item;
}
function pop(heap) {
  const removed = heap[0], last = heap.pop();
  if (!heap.length) return removed;
  let pos = 0, child = 1;
  while (child < heap.length) {
    const right = child + 1;
    if (right < heap.length && heap[child].value >= heap[right].value) child = right;
    heap[pos] = heap[child]; pos = child; child = pos * 2 + 1;
  }
  while (pos > 0) {
    const parent = (pos - 1) >> 1;
    if (last.value >= heap[parent].value) break;
    heap[pos] = heap[parent]; pos = parent;
  }
  heap[pos] = last;
  return removed;
}

function builder(input, params = {}) {
  const { nums, k } = parse(input, params);
  const detailed = nums.length <= 40, heap = [], discarded = new Set(), steps = [];
  let cursor = -1, imported = false, initialized = false, x;
  function emit(line, event, title, removed = null, final = false) {
    if (!detailed) return;
    const locals = { self: {}, nums: [...nums], k };
    if (imported) locals.heapq = "<module 'heapq'>";
    if (initialized) locals.heap = heap.map(item => item.value);
    if (x !== undefined) locals.x = x;
    steps.push({ title: bi(`Dòng ${line} · ${title.vi}`, `Line ${line} · ${title.en}`), codeLines: [line], final,
      vars: Object.entries(locals).map(([name, rawValue]) => ({ name, value: name === "self" ? "Solution" : Array.isArray(rawValue) ? JSON.stringify(rawValue) : rawValue, rawValue })),
      note: bi("", ""), arr: [], highlight: [], mark: [],
      kthLargest215View: { mode: "trace", line, source: base.code[line - 1].trim(), event, nums: [...nums], k, cursor,
        heap: heap.map(item => ({ ...item })), heapSize: heap.length, discarded: [...discarded], removed: removed && { ...removed },
        overflow: heap.length > k, answer: final ? heap[0].value : null }
    });
  }
  imported = true; emit(3, "import", bi("import heapq", "import heapq"));
  initialized = true; emit(4, "init", bi("heap = []", "heap = []"));
  for (let i = 0; i < nums.length; i++) {
    cursor = i; x = nums[i];
    emit(5, "visit", bi(`Xét ${x}`, `Visit ${x}`));
    push(heap, { value: x, index: i });
    emit(6, "push", bi(`Thêm ${x} vào min-heap`, `Push ${x} into min-heap`));
    const over = heap.length > k;
    emit(7, "check", bi(`${heap.length} > ${k}? ${over ? "Đúng" : "Sai"}`, `${heap.length} > ${k}? ${over ? "True" : "False"}`));
    if (over) {
      const removed = pop(heap); if (detailed) discarded.add(removed.index);
      emit(8, "pop", bi(`Bỏ nhỏ nhất: ${removed.value}`, `Drop smallest: ${removed.value}`), removed);
    }
  }
  emit(5, "loop-end", bi("Đã xét hết nums", "Finished nums"));
  emit(9, "return", bi(`Lớn thứ ${k} = ${heap[0].value}`, `Largest #${k} = ${heap[0].value}`), null, true);
  if (!detailed) steps.push({ title: bi(`Lớn thứ ${k} = ${heap[0].value}`, `Largest #${k} = ${heap[0].value}`), final: true,
    codeLines: [], vars: [{ name: "answer", value: heap[0].value, rawValue: heap[0].value }], note: bi("", ""), arr: [], highlight: [], mark: [],
    kthLargest215View: { mode: "summary", line: null, source: "", event: "return", nums: nums.slice(0, 24), total: nums.length,
      k, cursor: -1, heap: heap.slice(0, 24).map(item => ({ ...item })), heapSize: heap.length, discarded: [], removed: null, overflow: false, answer: heap[0].value }
  });
  return { input, answer: heap[0].value, steps };
}

module.exports = { 215: { ...base, debugMode: "line-by-line", builder, parseKthLargest215: parse,
  titleVi: bi("Giữ k số lớn nhất", "Keep the k largest"),
  statement: bi("Thêm từng số vào min-heap. Vượt k ô → bỏ số nhỏ nhất. Gốc cuối cùng là đáp án; số trùng vẫn được tính.", "Push each number into a min-heap. More than k items → drop the smallest. The final root is the answer; duplicates count."),
  inputLabel: bi("nums · các số cách nhau bằng dấu phẩy", "nums · comma-separated numbers"),
  approach: [bi("Thêm → vượt k → bỏ nhỏ nhất", "Push → exceed k → drop smallest"), bi("Giữ k số lớn nhất · đọc gốc", "Keep k largest · read the root")],
  complexity: { time: "O(n log(k + 1))", space: "O(k)", note: bi("Debug từng dòng với ≤40 số. Mảng lớn vẫn tính đủ; hình chỉ xem trước 24 ô.", "Line debug for ≤40 numbers. Larger arrays compute the full answer; pictures preview 24 items.") },
  liveArgs: (input, params) => { const { nums, k } = parse(input, params); return [nums, k]; }
} };
