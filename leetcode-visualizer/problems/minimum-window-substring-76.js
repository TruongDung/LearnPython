"use strict";

const base = require("./sliding")[76];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const CODE = [...base.code];

function parse(input, params = {}) {
  if (!params || typeof params !== "object" || Array.isArray(params)) throw new RangeError("#76: params phải là object / params must be an object.");
  if (typeof input !== "string" || !/^[A-Za-z]*$/.test(input)) throw new RangeError("s must contain only English letters / s chỉ gồm chữ cái Anh.");
  const t = params.t === undefined ? "ABC" : params.t;
  if (typeof t !== "string" || !/^[A-Za-z]*$/.test(t)) throw new RangeError("t must contain only English letters / t chỉ gồm chữ cái Anh.");
  if (input.length > 24) throw new RangeError("Visualization supports up to 24 characters in s / s tối đa 24 ký tự.");
  if (t.length > 12) throw new RangeError("Visualization supports up to 12 characters in t / t tối đa 12 ký tự.");
  return [input, t];
}

const PHASES = {
  5: bi("s hoặc t rỗng?", "Is s or t empty?"), 6: bi('Trả về ""', 'Return ""'),
  7: bi("Đếm ký tự cần lấy", "Count the required characters"), 8: bi("missing = len(t)", "missing = len(t)"),
  9: bi("left = 0", "left = 0"), 10: bi("Chưa có đáp án", "No best window yet"),
  11: bi("R tiến → đọc ký tự", "Move R → read a character"), 12: bi("Ký tự này còn thiếu?", "Is this character still owed?"),
  13: bi("missing giảm 1", "Decrease missing by one"), 14: bi("need[char] giảm 1", "Decrease need[char] by one"),
  15: bi("Đã đủ để co L?", "Enough characters to shrink L?"), 16: bi("Cửa sổ này ngắn hơn?", "Is this window shorter?"),
  17: bi("Lưu đáp án tốt hơn ✓", "Save a better window ✓"), 18: bi("Trả lại ký tự bên trái", "Give the left character back"),
  19: bi("Bỏ ký tự này sẽ thiếu?", "Does removing it create a debt?"), 20: bi("missing tăng 1", "Increase missing by one"),
  21: bi("L tiến → co cửa sổ", "Move L → shrink the window"), 22: bi("Trả đáp án đã lưu", "Return the saved best window"),
};

function builder(input, params = {}) {
  const [s, t] = parse(input, params), want = {};
  for (const char of t) want[char] = (want[char] ?? 0) + 1;
  const trace = runTrace({ code: CODE.join("\n"), method: "minWindow", args: [s, t] });
  // Counter updates and cursor moves are different Python statements. Track
  // membership only when the Counter changes, so transient frames stay honest.
  const counted = new Set();
  let pending = null, comparison = null, previous = null;
  const bestOf = x => x && x.end > 0 ? { start: x.start, end: x.end, text: s.slice(x.start, x.end), length: x.end - x.start } : null;
  const steps = trace.events.map(record => {
    const { line, locals: x } = record;
    if (line === 11) { pending = record.branch ? { kind: "add", index: x.right, char: x.char } : null; comparison = null; }
    if (line === 14) { counted.add(x.right); pending = null; }
    if (line === 18) { counted.delete(x.left); pending = { kind: "remove", index: x.left, char: s[x.left] }; comparison = null; }
    if (line === 21) pending = null;
    const left = x.left ?? null, right = x.right ?? null, missing = x.missing ?? null;
    const best = bestOf(x), inWindow = index => left !== null && right !== null && index >= left && index <= right;
    const need = Object.entries(want).map(([char, required]) => {
      const count = x.need ? x.need[char] ?? 0 : null;
      return { char, required, count, inside: count === null ? null : required - count,
        state: count === null ? "pending" : count > 0 ? "missing" : count === 0 ? "exact" : "surplus" };
    });
    const debt = x.need ? need.reduce((sum, item) => sum + Math.max(0, item.count), 0) : null;
    const inSync = [...s].every((_, index) => inWindow(index) === counted.has(index));
    if (line === 16) comparison = { length: right - left + 1, oldBest: best, first: x.end === 0, better: record.branch };
    let change = null;
    if (line === 14 || line === 18) {
      const char = line === 14 ? x.char : s[x.left];
      change = { name: `need[${char}]`, char, index: line === 14 ? x.right : x.left,
        before: previous.need[char] ?? 0, after: x.need[char], kind: line === 14 ? "add" : "remove" };
    }
    if (line === 13 || line === 20) change = { name: "missing", before: previous.missing, after: x.missing, index: line === 13 ? x.right : x.left };
    if (line === 21) change = { name: "left", before: previous.left, after: x.left, index: x.left };
    const exhausted = line === 11 && record.branch === false;
    const phase = exhausted ? bi("R đã duyệt hết chuỗi", "R has scanned the entire string") : PHASES[line];
    const view = {
      s, t, want, left, right, missing, need, counter: x.need ?? null, debt, inSync,
      counted: [...counted], pending: pending && { ...pending }, covered: debt === 0 && missing !== null && inSync,
      chars: [...s].map((char, index) => ({ char, index, required: Object.hasOwn(want, char),
        inWindow: inWindow(index), inBest: best !== null && index >= best.start && index < best.end,
        counted: counted.has(index), isLeft: index === left, isRight: index === right,
        entering: pending?.kind === "add" && pending.index === index, leaving: pending?.kind === "remove" && pending.index === index })),
      windowText: left === null || right === null ? null : s.slice(left, right + 1),
      windowLength: left === null || right === null ? null : Math.max(0, right - left + 1),
      best, bestChange: line === 17 ? { before: bestOf(previous), after: best } : null,
      comparison: comparison && { ...comparison }, change,
      source: { line, text: CODE[line - 1].trim(), timing: "after" }, phase,
      stage: record.returning ? "done" : line <= 10 ? "init" : line <= 14 || line === 15 && !record.branch ? "expand" : "shrink",
      answer: record.returning ? trace.answer : null,
      resultReason: record.returning ? line === 6 ? "empty-input" : best ? "found" : "not-found" : null,
      locals: x, outer: record.outer, frames: record.frames, scope: record.scope,
      branch: record.branch, returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    previous = x;
    return { arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final: record.returning,
      title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: ["left", "right", "char", "missing", "start", "end"].map(name => ({ name, value: x[name] ?? "—", rawValue: x[name] ?? null })),
      minWindow76View: view };
  });
  return { original: s, answer: trace.answer, steps };
}

module.exports = { 76: {
  ...base, code: CODE, builder, liveArgs: parse, allowEmptyInput: true, preserveInputWhitespace: true, debugMode: "line-by-line",
  titleVi: bi("Cửa sổ nhỏ nhất phủ đủ t", "Minimum window covering t"),
  statement: bi('Tìm đoạn liên tiếp ngắn nhất trong s chứa đủ mọi ký tự của t, kể cả số lần lặp. Không có thì trả về "".',
    'Find the shortest contiguous substring of s covering all characters of t, including duplicates. Return "" if none exists.'),
  inputLabel: bi("s · chữ cái Anh · tối đa 24 ký tự", "s · English letters · up to 24 characters"),
  extraParams: [{ key: "t", type: "string", allowEmpty: true, label: bi("t · cần lấy · tối đa 12 ký tự", "t · required · up to 12 characters"), default: "ABC" }],
  approach: [bi("R thêm ký tự → đủ thì co L → lưu đoạn ngắn nhất. need âm = thừa ký tự, bỏ được.",
    "Expand R → shrink L when covered → save the shortest window. NEGATIVE need means surplus characters can be dropped.")],
  complexity: { time: "O(|s| + |t|)", space: "O(Σ)", note: bi("Counter lưu cả chữ ngoài t; Σ ≤ 52 chữ cái Anh.", "Counter also stores letters outside t; Σ ≤ 52 English letters.") },
  codeLabel: bi("Counter + cửa sổ trượt · từng dòng Python", "Counter + sliding window · Python line by line"),
  visualizationLimits: { maxSourceLength: 24, maxTargetLength: 12, completeTrace: true },
} };
