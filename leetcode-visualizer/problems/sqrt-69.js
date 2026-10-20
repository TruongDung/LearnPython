"use strict";
const base = require("./binary-search")[69];
const bi = (vi, en) => ({ vi, en });
const code = [
  "class Solution:",
  "    def mySqrt(self, x):",
  "        if x < 2:",
  "            return x",
  "        lo, hi = 1, x // 2",
  "        while lo <= hi:",
  "            mid = (lo + hi) // 2",
  "            if mid * mid == x:",
  "                return mid",
  "            if mid * mid < x:",
  "                lo = mid + 1",
  "            else:",
  "                hi = mid - 1",
  "        return hi",
];
function parse(input) {
  const value = Array.isArray(input) ? input[0] : input;
  if (Array.isArray(input) && input.length !== 1 || !["number", "string"].includes(typeof value) || typeof value === "string" && value.trim() === "") throw new Error("x: nhập đúng một số nguyên từ 0 đến 2147483647.");
  const x = Number(value);
  if (!Number.isInteger(x) || x < 0 || x > 2147483647) throw new Error("x phải là số nguyên từ 0 đến 2147483647.");
  return x;
}
function builder(input) {
  const x = parse(input), bigX = BigInt(x), locals = { self: {}, x }, steps = [], history = [];
  let round = 0, window = null;
  function emit(line, event, label, options = {}) {
    const final = Object.hasOwn(options, "answer");
    const midVisible = ["mid", "equal", "less", "raise-lo", "lower-hi", "perfect"].includes(event);
    steps.push({ title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), codeLines: [line], final,
      arr: [], highlight: [], mark: [], note: bi("", ""),
      vars: Object.entries(locals).map(([name, rawValue]) => ({ name, rawValue: name === "self" ? {} : rawValue, value: name === "self" ? "Solution" : rawValue })),
      sqrt69View: { x, event, line, source: code[line - 1].trim(), round, lo: locals.lo ?? null, hi: locals.hi ?? null, mid: locals.mid ?? null,
        visualSide: final ? options.answer : midVisible ? locals.mid : null,
        square: final ? String(BigInt(options.answer) * BigInt(options.answer)) : midVisible ? String(BigInt(locals.mid) * BigInt(locals.mid)) : null,
        window: window && { ...window }, history: history.map(item => ({ ...item })), check: options.check ?? null,
        cut: options.cut || null, answer: final ? options.answer : null }
    });
  }
  emit(3, "small-check", bi(`${x} < 2? ${x < 2 ? "Đúng" : "Sai"}`, `${x} < 2? ${x < 2 ? "True" : "False"}`), { check: x < 2 });
  if (x < 2) {
    emit(4, "small-return", bi(`Trả về ${x}`, `Return ${x}`), { answer: x });
    return { original: [x], answer: x, steps };
  }
  locals.lo = 1; locals.hi = Math.floor(x / 2); window = { lo: locals.lo, hi: locals.hi };
  emit(5, "init", bi(`Khoảng [${locals.lo}, ${locals.hi}]`, `Range [${locals.lo}, ${locals.hi}]`));
  while (true) {
    window = { lo: locals.lo, hi: locals.hi };
    const active = locals.lo <= locals.hi;
    emit(6, "while", bi(active ? "Còn khoảng → xét tiếp" : "lo > hi → hết khoảng", active ? "Range remains → continue" : "lo > hi → empty range"), { check: active });
    if (!active) break;
    round++;
    locals.mid = Math.floor((locals.lo + locals.hi) / 2);
    const square = BigInt(locals.mid) * BigInt(locals.mid);
    emit(7, "mid", bi(`mid = ${locals.mid}`, `mid = ${locals.mid}`));
    emit(8, "equal", bi(`mid² == x? ${square === bigX ? "Đúng" : "Sai"}`, `mid² == x? ${square === bigX ? "True" : "False"}`), { check: square === bigX });
    if (square === bigX) {
      history.push({ ...window, mid: locals.mid, square: String(square), move: "found" });
      emit(9, "perfect", bi(`${locals.mid}² = ${x}`, `${locals.mid}² = ${x}`), { answer: locals.mid });
      return { original: [x], answer: locals.mid, steps };
    }
    emit(10, "less", bi(`mid² < x? ${square < bigX ? "Đúng" : "Sai"}`, `mid² < x? ${square < bigX ? "True" : "False"}`), { check: square < bigX });
    if (square < bigX) {
      const before = locals.lo; locals.lo = locals.mid + 1;
      history.push({ ...window, mid: locals.mid, square: String(square), move: "right" });
      emit(11, "raise-lo", bi(`lo: ${before} → ${locals.lo}`, `lo: ${before} → ${locals.lo}`), { cut: [before, locals.mid] });
    } else {
      const before = locals.hi; locals.hi = locals.mid - 1;
      history.push({ ...window, mid: locals.mid, square: String(square), move: "left" });
      emit(13, "lower-hi", bi(`hi: ${before} → ${locals.hi}`, `hi: ${before} → ${locals.hi}`), { cut: [locals.mid, before] });
    }
  }
  emit(14, "return-hi", bi(`Làm tròn xuống → ${locals.hi}`, `Round down → ${locals.hi}`), { answer: locals.hi });
  return { original: [x], answer: locals.hi, steps };
}
module.exports = { 69: { ...base, code, builder, debugMode: "line-by-line", parseSqrt69: parse,
  titleVi: bi("Tìm cạnh vuông lớn nhất vừa x ô", "Find the largest square side that fits x cells"),
  statement: bi("Trả về số nguyên a sao cho a² ≤ x < (a+1)². Ví dụ x = 8 → a = 2.", "Return integer a with a² ≤ x < (a+1)². Example: x = 8 → a = 2."),
  inputLabel: bi("x · 0 đến 2147483647", "x · 0 to 2147483647"),
  approach: [bi("mid² < x → thử cạnh lớn hơn", "mid² < x → try a larger side"), bi("mid² > x → thử cạnh nhỏ hơn", "mid² > x → try a smaller side")],
  complexity: { time: "O(log(x + 1))", space: "O(1)", note: bi("Mỗi lượt bỏ một nửa khoảng. Debug đầy đủ cả x lớn; hình ô vuông lớn được thu nhỏ.", "Discard half the range per round. Full debug even for large x; large square pictures are scaled.") },
  liveArgs: input => [parse(input)]
} };
