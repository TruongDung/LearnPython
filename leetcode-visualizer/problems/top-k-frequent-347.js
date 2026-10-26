"use strict";

const { bi, parsePlainParams, parseInteger, parseIntegerArray } = require("./hard-viz-shared");
const base = require("./heap")[347];
const copy = value => JSON.parse(JSON.stringify(value));

function parseTopK347(input = base.defaultInput, params) {
  const options = parsePlainParams(params, 347);
  const nums = parseIntegerArray(Array.isArray(input) ? Array.from(input) : input, { problemId: 347, name: "nums", maxLength: 100 })
    .map(value => value === 0 ? 0 : value);
  const unique = new Set(nums).size;
  const k = parseInteger(options.k === undefined ? Math.min(2, unique) : options.k, { problemId: 347, name: "k", min: 1, max: unique });
  return { nums, k };
}

function buildSteps347(input, params) {
  const { nums, k } = parseTopK347(input, params), counts = new Map();
  nums.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  const frequencies = [...counts].map(([value, count], id) => ({ value, count, id }));
  const state = { nums, k }, heap = [], steps = [];
  let counterReady = false, processedCount = 0;
  const less = (a, b) => a.f < b.f || a.f === b.f && a.v < b.v;
  function siftDown(start, pos) {
    const item = heap[pos];
    while (pos > start) {
      const parent = (pos - 1) >> 1;
      if (!less(item, heap[parent])) break;
      heap[pos] = heap[parent]; pos = parent;
    }
    heap[pos] = item;
  }
  function push(entry) { heap.push(entry); siftDown(0, heap.length - 1); }
  function pop() {
    const removed = heap[0], last = heap.pop();
    if (heap.length) {
      let pos = 0, child = 1;
      while (child < heap.length) {
        const right = child + 1;
        if (right < heap.length && !less(heap[child], heap[right])) child = right;
        heap[pos] = heap[child]; pos = child; child = 2 * pos + 1;
      }
      heap[pos] = last; siftDown(0, pos);
    }
    return removed;
  }
  const captions = {
    "counter-import": bi("Chuẩn bị đếm", "Prepare to count"), count: bi("Đếm tần suất", "Count frequencies"),
    "heap-import": bi("Chuẩn bị heap", "Prepare the heap"), init: bi("Khởi tạo heap", "Initialize the heap"),
    select: bi("Xét một giá trị", "Select a value"), push: bi("Thêm vào heap", "Push into the heap"),
    check: bi("Heap có vượt k?", "Does the heap exceed k?"), pop: bi("Bỏ phần tử nhỏ nhất", "Pop the smallest entry"),
    "loop-done": bi("Đã xét mọi giá trị", "All values processed"), done: bi("Kết quả top k", "Top k result"),
  };
  function emit(line, phase, detail = {}) {
    if (state.heap) state.heap = heap.map(entry => [entry.f, entry.v]);
    steps.push({
      title: captions[phase], note: bi("", ""), arr: [], highlight: [], mark: [], codeLines: [line], codeBlock: 1, final: phase === "done",
      vars: [{ name: "k", value: k }, { name: "v", value: state.v ?? "—" }, { name: "f", value: state.f ?? "—" },
        { name: "len(heap)", value: state.heap ? heap.length : "—" }, { name: "heap[0]", value: heap.length ? `(${heap[0].f}, ${heap[0].v})` : "—" }],
      topK347View: {
        nums: [...nums], k, frequencies: counterReady ? frequencies.map(entry => ({ ...entry })) : [], counterReady,
        heapReady: state.heap !== undefined, heap: heap.map(entry => ({ ...entry })), phase, processedCount,
        focusValue: ["select", "push", "check", "pop"].includes(phase) ? state.v : null,
        action: detail.action || null, check: detail.check ?? null, answer: phase === "done" ? heap.map(entry => entry.v) : null,
        locals: copy(state), source: { line, text: base.code[line - 1], timing: "after" },
      },
    });
  }
  emit(3, "counter-import");
  counterReady = true; state.freq = Object.fromEntries(counts); emit(4, "count");
  emit(5, "heap-import");
  state.heap = []; emit(6, "init");
  for (const entry of frequencies) {
    state.v = entry.value; state.f = entry.count; processedCount++;
    emit(7, "select");
    const item = { v: entry.value, f: entry.count, id: entry.id };
    push(item); emit(8, "push", { action: { kind: "push", ...item } });
    const over = heap.length > k; emit(9, "check", { check: over });
    if (over) { const removed = pop(); emit(10, "pop", { action: { kind: "pop", ...removed } }); }
  }
  emit(7, "loop-done"); emit(11, "done");
  return { original: [...nums], answer: heap.map(entry => entry.v), steps };
}

module.exports = {
  347: {
    ...base, builder: buildSteps347, debugMode: "line-by-line",
    inputLabel: bi("nums · dấu phẩy hoặc JSON · 1–100 số nguyên", "nums · comma-separated or JSON · 1–100 integers"),
    extraParams: [{ key: "k", label: bi("k · số giá trị cần giữ", "k · values to keep"), default: 2, min: 1, max: 100 }],
    approach: [bi("Đếm số lần xuất hiện → mỗi giá trị thành một cột.", "Count occurrences → one column per value."),
      bi("Thêm (f, v) vào min-heap. Vượt k → bỏ gốc nhỏ nhất.", "Push (f, v) into the min-heap. Above k → pop the smallest root."),
      bi("Các giá trị còn trong heap là kết quả.", "The values remaining in the heap form the result.")],
    complexity: { time: "O(n + u log(k+1))", space: "O(u + k)", note: bi("u là số giá trị khác nhau.", "u is the number of distinct values.") },
    visualizationLimits: { maxNums: 100 }, liveArgs: (input, params) => { const { nums, k } = parseTopK347(input, params); return [nums, k]; },
  },
};
