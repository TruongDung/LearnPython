"use strict";
const bi = (vi, en) => ({ vi, en });
const code = [
  "class Solution:",
  "    def minSwap(self, nums1, nums2):",
  "        n = len(nums1)",
  "        keep, swap = 0, 1",
  "        for i in range(1, n):",
  "            next_keep = next_swap = n + 1",
  "            if nums1[i-1] < nums1[i] and nums2[i-1] < nums2[i]:",
  "                next_keep = keep",
  "                next_swap = swap + 1",
  "            if nums1[i-1] < nums2[i] and nums2[i-1] < nums1[i]:",
  "                next_keep = min(next_keep, swap)",
  "                next_swap = min(next_swap, keep + 1)",
  "            keep, swap = next_keep, next_swap",
  "        return min(keep, swap)",
];
function parseArray(value, name) {
  let result = value;
  if (typeof value === "string") {
    const text = value.trim();
    if (text.startsWith("[")) { try { result = JSON.parse(text); } catch { throw new Error(`${name}: mảng không hợp lệ / invalid array.`); } }
    else {
      if (!/^\d+(\s*,\s*\d+)*$/.test(text)) throw new Error(`${name}: nhập các số nguyên cách nhau bằng dấu phẩy / enter comma-separated integers.`);
      result = text.split(",").map(Number);
    }
  }
  if (!Array.isArray(result) || result.length < 2 || result.length > 100000 || !result.every(x => typeof x === "number" && Number.isInteger(x) && x >= 0 && x <= 200000)) {
    throw new Error(`${name}: cần 2–100000 số nguyên trong [0, 200000] / expected 2–100000 integers in [0, 200000].`);
  }
  return [...result];
}
function parse(input, params = {}) {
  const a = parseArray(input, "nums1"), b = parseArray(params.nums2 === undefined ? "1,2,3,7" : params.nums2, "nums2");
  if (a.length !== b.length) throw new Error("nums1 và nums2 phải cùng độ dài / arrays must have equal lengths.");
  return [a, b];
}
// A separate witness for the final picture; these are not Python source locals.
function solve(a, b) {
  const n = a.length, inf = n + 1, parents = Array.from({ length: n }, () => [-1, -1]);
  let costs = [0, 1];
  for (let i = 1; i < n; i++) {
    const next = [inf, inf];
    for (let before = 0; before < 2; before++) for (let now = 0; now < 2; now++) {
      const top0 = before ? b[i - 1] : a[i - 1], bottom0 = before ? a[i - 1] : b[i - 1];
      const top1 = now ? b[i] : a[i], bottom1 = now ? a[i] : b[i];
      if (top0 < top1 && bottom0 < bottom1 && costs[before] < inf && costs[before] + now < next[now]) {
        next[now] = costs[before] + now; parents[i][now] = before;
      }
    }
    costs = next;
  }
  const answer = Math.min(...costs);
  if (answer >= inf) throw new Error("Không thể làm cả hai dãy tăng nghiêm ngặt bằng đổi cùng cột / no valid sequence of column swaps.");
  let state = costs[0] <= costs[1] ? 0 : 1;
  const swapped = [];
  for (let i = n - 1; i >= 0; i--) { if (state) swapped.push(i); state = parents[i][state]; }
  return { answer, swapped: swapped.reverse() };
}
function builder(input, params = {}) {
  const [a, b] = parse(input, params), n = a.length, witness = solve(a, b), detailed = n <= 40;
  if (!detailed) return { original: a, answer: witness.answer, steps: [{ title: bi("Kết quả · xem trước 12 cột", "Result · first 12 columns"), codeLines: [], vars: [], arr: [], highlight: [], mark: [], note: bi("", ""), final: true,
    minSwaps801View: { mode: "summary", n, a: a.slice(0, 12), b: b.slice(0, 12), event: "return", line: null, source: "", i: null, states: null, previous: null, checks: { straight: null, cross: null }, history: [], answer: witness.answer, swapped: witness.swapped.slice(0, 16), shownSwapped: witness.swapped.filter(i => i < 12) } }] };
  const locals = { self: {}, nums1: a, nums2: b }, steps = [], history = [];
  let previous = null, checks = { straight: null, cross: null };
  function emit(line, event, title, final = false, update = null) {
    steps.push({ title: bi(`Dòng ${line} · ${title.vi}`, `Line ${line} · ${title.en}`), codeLines: [line], arr: [], highlight: [], mark: [], note: bi("", ""), final,
      vars: Object.entries(locals).map(([name, raw]) => ({ name, rawValue: Array.isArray(raw) ? [...raw] : typeof raw === "object" ? { ...raw } : raw, value: name === "self" ? "Solution" : Array.isArray(raw) ? [...raw] : raw })),
      minSwaps801View: { mode: "trace", n, a: [...a], b: [...b], event, line, source: code[line - 1].trim(), i: locals.i ?? null,
        states: { keep: locals.keep ?? null, swap: locals.swap ?? null, next_keep: locals.next_keep ?? null, next_swap: locals.next_swap ?? null },
        previous: previous && { ...previous }, checks: { ...checks }, history: history.map(row => ({ ...row })), update,
        answer: final ? witness.answer : null, swapped: final ? [...witness.swapped] : [], shownSwapped: final ? [...witness.swapped] : [] }
    });
  }
  locals.n = n; emit(3, "length", bi(`${n} cột`, `${n} columns`));
  locals.keep = 0; locals.swap = 1; history.push({ i: 0, keep: 0, swap: 1 });
  emit(4, "init", bi("Cột 0: giữ = 0, đổi = 1", "Column 0: keep = 0, swap = 1"));
  for (let i = 1; i < n; i++) {
    locals.i = i; previous = { keep: locals.keep, swap: locals.swap }; checks = { straight: null, cross: null };
    emit(5, "column", bi(`Xét cột ${i}`, `Consider column ${i}`));
    locals.next_keep = n + 1; locals.next_swap = n + 1;
    emit(6, "reset", bi("Hai trạng thái mới: chưa có đường", "New states: no path yet"));
    checks.straight = a[i - 1] < a[i] && b[i - 1] < b[i];
    emit(7, "straight", bi(`Nối thẳng: ${checks.straight ? "✓" : "✕"}`, `Straight: ${checks.straight ? "✓" : "✕"}`));
    if (checks.straight) {
      locals.next_keep = locals.keep; emit(8, "keep-keep", bi("Giữ → giữ · +0", "Keep → keep · +0"));
      locals.next_swap = locals.swap + 1; emit(9, "swap-swap", bi("Đổi → đổi · +1", "Swap → swap · +1"));
    }
    checks.cross = a[i - 1] < b[i] && b[i - 1] < a[i];
    emit(10, "cross", bi(`Nối chéo: ${checks.cross ? "✓" : "✕"}`, `Cross: ${checks.cross ? "✓" : "✕"}`));
    if (checks.cross) {
      const beforeKeep = locals.next_keep, beforeSwap = locals.next_swap;
      locals.next_keep = Math.min(locals.next_keep, locals.swap); emit(11, "swap-keep", bi("Đổi → giữ · chọn min", "Swap → keep · take min"), false, { name: "next_keep", left: beforeKeep, right: locals.swap, result: locals.next_keep });
      locals.next_swap = Math.min(locals.next_swap, locals.keep + 1); emit(12, "keep-swap", bi("Giữ → đổi · chọn min", "Keep → swap · take min"), false, { name: "next_swap", left: beforeSwap, right: locals.keep + 1, result: locals.next_swap });
    }
    locals.keep = locals.next_keep; locals.swap = locals.next_swap; history.push({ i, keep: locals.keep, swap: locals.swap });
    emit(13, "commit", bi(`Xong cột ${i}`, `Column ${i} complete`));
  }
  emit(5, "loop-end", bi("Đã xét hết cột", "All columns processed"));
  emit(14, "return", bi(`Ít nhất ${witness.answer} lần đổi`, `Minimum ${witness.answer} swaps`), true);
  return { original: a, answer: witness.answer, steps };
}
module.exports = { 801: {
  id: 801, difficulty: "hard", slug: "minimum-swaps-to-make-sequences-increasing", category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
  title: bi("Minimum Swaps To Make Sequences Increasing", "Minimum Swaps To Make Sequences Increasing"),
  titleVi: bi("Đổi ít nhất để cả hai hàng tăng", "Fewest swaps to make both rows increase"),
  statement: bi("Mỗi lần chỉ đổi nums1[i] ↕ nums2[i]. Làm cả hai hàng tăng nghiêm ngặt với ít lần đổi nhất.", "Each swap exchanges nums1[i] ↕ nums2[i]. Make both rows strictly increasing with the fewest swaps."),
  inputKind: "string", defaultInput: "1,3,5,4", inputLabel: bi("nums1 · các số cách nhau dấu phẩy", "nums1 · comma-separated numbers"),
  extraParams: [{ key: "nums2", type: "string", default: "1,2,3,7", label: bi("nums2 · cùng số phần tử", "nums2 · same number of elements") }],
  approach: [bi("keep / swap: số lần đổi ít nhất khi giữ / đổi cột hiện tại.", "keep / swap: minimum swaps when keeping / swapping the current column."), bi("Nối thẳng → cùng trạng thái. Nối chéo → khác trạng thái.", "Straight → same state. Cross → different state.")],
  complexity: { time: "O(n)", space: "O(1)", note: bi("Mã Python dùng O(1) bộ nhớ. Debug ≤40 cột; mảng dài tính đủ, hình xem trước 12 cột.", "Python uses O(1) space. Full debug for ≤40 columns; larger arrays compute fully and preview 12 columns.") },
  code, builder, debugMode: "line-by-line", liveArgs: (input, params) => { const arrays = parse(input, params); solve(...arrays); return arrays; }
} };
