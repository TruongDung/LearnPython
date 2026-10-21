"use strict";
const base = require("./hashmap")[560];
const bi = (vi, en) => ({ vi, en });
const code = [
  "class Solution:",
  "    def subarraySum(self, nums, k):",
  "        count = {0: 1}",
  "        prefix = 0",
  "        res = 0",
  "        for i, x in enumerate(nums):",
  "            prefix += x",
  "            need = prefix - k",
  "            hits = count.get(need, 0)",
  "            res += hits",
  "            count[prefix] = count.get(prefix, 0) + 1",
  "        return res",
];
function parse(nums, params = {}) {
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20000 || !nums.every(x => Number.isInteger(x) && x >= -1000 && x <= 1000)) {
    throw new Error("nums: cần 1–20000 số nguyên trong [-1000,1000]. / Use 1–20000 integers in [-1000,1000].");
  }
  const k = params.k === undefined ? 2 : params.k;
  if (!Number.isInteger(k) || Math.abs(k) > 10000000) throw new Error("k: cần số nguyên trong [-10⁷,10⁷]. / Use an integer in [-10⁷,10⁷].");
  return [[...nums], k];
}
function builder(input, params) {
  const [nums, k] = parse(input, params), detailed = nums.length <= 30;
  const count = new Map([[0, 1]]), positions = new Map([[0, [0]]]), prefixes = [0], found = [], steps = [];
  const locals = { self: {}, nums, k }, state = { need: null, lookup: null, addition: null, store: null };
  function emit(line, event, title) {
    if (!detailed) return;
    const raw = value => typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
    steps.push({ title: bi(`Dòng ${line} · ${title.vi}`, `Line ${line} · ${title.en}`), codeLines: [line], codeBlock: 1,
      final: event === "return", arr: [], highlight: [], mark: [], note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, rawValue: raw(value), value: name === "self" ? "Solution" : typeof value === "object" ? JSON.stringify(value) : value })),
      subarray560View: { mode: "trace", line, source: code[line - 1].trim(), event, nums: [...nums], total: nums.length, k,
        i: locals.i ?? null, prefix: locals.prefix ?? null, res: locals.res ?? null, prefixes: [...prefixes],
        entries: [...count].map(([sum, frequency]) => ({ sum, frequency, positions: [...positions.get(sum)] })),
        need: state.need, lookup: state.lookup && { ...state.lookup, positions: [...state.lookup.positions] },
        addition: state.addition && { ...state.addition }, store: state.store && { ...state.store },
        found: found.map(range => ({ ...range })) }
    });
  }
  locals.count = { 0: 1 }; emit(3, "init-count", bi("Mốc rỗng P[0] = 0", "Empty prefix P[0] = 0"));
  locals.prefix = 0; emit(4, "init-prefix", bi("prefix = 0", "prefix = 0"));
  locals.res = 0; emit(5, "init-res", bi("Chưa đếm đoạn nào", "No ranges counted yet"));
  for (let i = 0; i < nums.length; i++) {
    locals.i = i; locals.x = nums[i];
    state.need = null; state.lookup = null; state.addition = null; state.store = null;
    emit(6, "loop", bi(`Đọc nums[${i}]`, `Read nums[${i}]`));
    locals.prefix += locals.x;
    if (detailed) prefixes.push(locals.prefix);
    emit(7, "prefix", bi(`prefix += ${locals.x}`, `prefix += ${locals.x}`));
    locals.need = locals.prefix - k; state.need = locals.need;
    emit(8, "need", bi(`Cần prefix cũ = ${locals.need}`, `Need an earlier prefix = ${locals.need}`));
    locals.hits = count.get(locals.need) || 0;
    if (detailed) state.lookup = { need: locals.need, hits: locals.hits, positions: [...(positions.get(locals.need) || [])] };
    emit(9, "lookup", bi(`Tìm thấy ${locals.hits} mốc`, `Found ${locals.hits} earlier prefixes`));
    const before = locals.res; locals.res += locals.hits;
    if (detailed) {
      state.addition = { before, hits: locals.hits, after: locals.res };
      for (const start of state.lookup.positions) found.push({ start, end: i });
    }
    emit(10, "count", bi(`res: ${before} + ${locals.hits} = ${locals.res}`, `res: ${before} + ${locals.hits} = ${locals.res}`));
    const prior = count.get(locals.prefix) || 0;
    count.set(locals.prefix, prior + 1);
    if (detailed) {
      if (!positions.has(locals.prefix)) positions.set(locals.prefix, []);
      positions.get(locals.prefix).push(i + 1);
      state.store = { sum: locals.prefix, boundary: i + 1, before: prior, after: prior + 1 };
      locals.count = Object.fromEntries(count);
    }
    emit(11, "store", bi(`Lưu P[${i + 1}] sau khi đếm`, `Store P[${i + 1}] after counting`));
  }
  state.need = null; state.lookup = null; state.addition = null; state.store = null;
  // CPython executes the for header once more when its iterator is exhausted.
  emit(6, "loop-end", bi("Đã đọc hết nums", "All numbers processed"));
  emit(12, "return", bi(`Trả về ${locals.res}`, `Return ${locals.res}`));
  if (!detailed) steps.push({ title: bi(`Đáp án: ${locals.res}`, `Answer: ${locals.res}`), codeLines: [], codeBlock: 1,
    final: true, arr: [], highlight: [], mark: [], vars: [], note: bi("", ""),
    subarray560View: { mode: "summary", line: null, source: "", event: "return", nums: nums.slice(0, 12), total: nums.length, k,
      i: null, prefix: null, res: locals.res, prefixes: [], entries: [], need: null, lookup: null, addition: null, store: null, found: [] }
  });
  return { original: nums, answer: locals.res, steps };
}
module.exports = { 560: { ...base, code, builder, debugMode: "line-by-line",
  statement: bi("Đếm đoạn liên tiếp, không rỗng có tổng = k. Mỗi prefix cũ phù hợp tạo đúng một đoạn.", "Count non-empty contiguous ranges summing to k. Each matching earlier prefix gives one range."),
  approach: [bi("prefix − k → tra count → cộng số lần khớp", "prefix − k → look up count → add matching frequency"),
    bi("Đếm trước, lưu prefix sau. P[0] = 0 là mốc trước mảng.", "Count first, store the prefix afterward. P[0] = 0 is the boundary before the array.")],
  extraParams: [{ ...base.extraParams[0], min: -10000000, max: 10000000 }],
  complexity: { time: "O(n)", space: "O(n)", note: bi("Debug từng dòng với ≤30 số. Mảng lớn vẫn đếm đủ; hình xem trước 12 số.", "Line debug for ≤30 numbers. Larger arrays are fully counted; pictures preview 12 numbers.") },
  liveArgs: (input, params) => parse(input, params)
} };
