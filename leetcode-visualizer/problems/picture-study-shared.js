"use strict";

const bi = (vi, en = vi) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));

function integer(value, min, max, name) {
  if (typeof value === "string" && !value.trim()) throw new TypeError(`${name}: cần số nguyên / enter an integer.`);
  const parsed = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) throw new RangeError(`${name}: ${min}..${max}.`);
  return parsed === 0 ? 0 : parsed;
}

function gridInput(input, { square = false, min = 0, max = 1000000 } = {}) {
  let rows = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new TypeError("Ma trận rỗng / empty matrix.");
    if (text.startsWith("[")) {
      try { rows = JSON.parse(text); } catch (_) { throw new TypeError("Ma trận JSON không hợp lệ / invalid matrix JSON."); }
    } else rows = text.split(/[;\n]/).map(row => row.split(","));
  }
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 10 || !Array.isArray(rows[0]) || rows[0].length < 1 || rows[0].length > 10) {
    throw new RangeError("Ma trận: 1–10 hàng/cột / matrix: 1–10 rows/columns.");
  }
  const width = rows[0].length;
  if (square && rows.length !== width) throw new RangeError("#378: cần ma trận vuông / use a square matrix.");
  return rows.map(row => {
    if (!Array.isArray(row) || row.length !== width) throw new RangeError("Các hàng phải cùng độ dài / rows must have equal length.");
    return row.map(value => integer(value, min, max, "grid"));
  });
}

// Match Python heapq's tuple ordering and sift choices, including heapify.
const less = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
};
function siftUp(heap, start, pos) {
  const item = heap[pos];
  while (pos > start) {
    const parent = (pos - 1) >> 1;
    if (!less(item, heap[parent])) break;
    heap[pos] = heap[parent]; pos = parent;
  }
  heap[pos] = item;
}
function siftDown(heap, pos) {
  const start = pos, item = heap[pos];
  let child = 2 * pos + 1;
  while (child < heap.length) {
    const right = child + 1;
    if (right < heap.length && !less(heap[child], heap[right])) child = right;
    heap[pos] = heap[child]; pos = child; child = 2 * pos + 1;
  }
  heap[pos] = item; siftUp(heap, start, pos);
}
function heapPush(heap, entry) { heap.push(entry); siftUp(heap, 0, heap.length - 1); }
function heapPop(heap) {
  const root = heap[0], tail = heap.pop();
  if (heap.length) { heap[0] = tail; siftDown(heap, 0); }
  return root;
}
function heapify(heap) { for (let i = (heap.length >> 1) - 1; i >= 0; i--) siftDown(heap, i); }

function pictureTrace(id, source, watches) {
  const steps = [];
  return { steps, emit(line, phase, values, view, final = false) {
    if (!source[line - 1]) throw new RangeError(`#${id}: missing source line ${line}`);
    steps.push({ title: bi(phase), note: bi(""), arr: [], highlight: [], mark: [], codeBlock: 1,
      codeLines: [line], final, vars: watches.map(name => ({ name, value: values[name] ?? "—" })),
      pictureStudyView: copy({ id, line, phase, ...view }) });
  } };
}

module.exports = { bi, copy, integer, gridInput, less, heapPush, heapPop, heapify, pictureTrace };
