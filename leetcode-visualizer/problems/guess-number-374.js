"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "class Solution:",
  "    def guessNumber(self, n: int) -> int:",
  "        lo, hi = 1, n",
  "        while lo <= hi:",
  "            mid = lo + (hi - lo) // 2",
  "            feedback = guess(mid)",
  "            if feedback == 0:",
  "                return mid",
  "            if feedback == -1:",
  "                hi = mid - 1",
  "            else:",
  "                lo = mid + 1",
  "        return -1",
]);

function parseInput(input, params = {}) {
  if (!Array.isArray(input) || input.length !== 1 || !Number.isInteger(input[0]) || input[0] < 1 || input[0] > 2147483647) {
    throw new RangeError("374: n must be one integer in [1, 2147483647] / n là một số nguyên từ 1 đến 2147483647.");
  }
  const n = input[0], raw = params.pick === undefined ? 6 : params.pick;
  if (typeof raw !== "number" && (typeof raw !== "string" || !/^\d+$/.test(raw.trim()))) throw new TypeError("374: pick must be an integer / pick phải là số nguyên.");
  const pick = Number(raw);
  if (!Number.isInteger(pick) || pick < 1 || pick > n) throw new RangeError("374: pick must be in [1, n] / pick phải nằm trong [1, n].");
  return { n, pick };
}

function buildSteps(input, params = {}) {
  const { n, pick } = parseInput(input, params);
  const guess = number => number > pick ? -1 : number < pick ? 1 : 0;
  let lo, hi, mid, feedback, responseForMid;
  const history = [], steps = [];
  function emit(line, phase, extra = {}) {
    const locals = { n };
    for (const [name, value] of Object.entries({ lo, hi, mid, feedback })) if (value !== undefined) locals[name] = value;
    const view = {
      n, lo: lo ?? null, hi: hi ?? null, mid: mid ?? null,
      feedback: responseForMid === mid && feedback !== undefined ? feedback : null,
      phase, source: { line, text: CODE[line - 1], timing: "before" }, locals,
      calls: history.length, history: history.map(entry => ({ ...entry })),
      answer: null, final: false, ...extra,
    };
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final: !!extra.final,
      title: bi("Đoán số bằng tìm kiếm nhị phân", "Guess a number with binary search"), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })), guessNumber374View: view });
  }
  emit(3, "init"); lo = 1; hi = n;
  while (true) {
    emit(4, "while"); if (!(lo <= hi)) break;
    emit(5, "mid"); mid = lo + Math.floor((hi - lo) / 2);
    emit(6, "call"); feedback = guess(mid); responseForMid = mid;
    history.push({ number: mid, feedback, lo, hi });
    emit(7, "check-equal");
    if (feedback === 0) {
      emit(8, "found", { final: true, answer: mid });
      return { original: [n], n, answer: mid, calls: history.length, steps };
    }
    emit(9, "check-direction");
    if (feedback === -1) { emit(10, "lower", { nextLo: lo, nextHi: mid - 1 }); hi = mid - 1; }
    else { emit(12, "higher", { nextLo: mid + 1, nextHi: hi }); lo = mid + 1; }
  }
  throw new Error("374: The guess API violated the guaranteed hidden-number contract.");
}

module.exports = { 374: {
  id: 374, difficulty: "easy", slug: "guess-number-higher-or-lower",
  category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
  title: bi("Guess Number Higher or Lower", "Guess Number Higher or Lower"),
  titleVi: bi("Đoán số cao hơn hoặc thấp hơn", "Guess the hidden number"),
  statement: bi("Đoán một số bí mật trong [1,n]. guess(x) trả -1 nếu đoán quá cao, 1 nếu quá thấp, 0 nếu đúng. Tìm số bí mật với ít lần gọi nhất.", "Find a hidden number in [1,n]. guess(x) returns -1 if your guess is too high, 1 if too low, and 0 if correct."),
  defaultInput: [10], inputKind: "integer", inputLabel: bi("n · 1–2147483647", "n · 1–2147483647"),
  extraParams: [{ key: "pick", type: "number", min: 1, max: 2147483647, default: 6, label: bi("pick · số bí mật để mô phỏng API", "pick · hidden number for API simulation") }],
  approach: [
    bi("Giữ khoảng [lo,hi]; đoán số giữa bằng guess(mid).", "Keep [lo,hi] and call guess(mid) at its midpoint."),
    bi("-1 → hi = mid − 1. 1 → lo = mid + 1. 0 → trả mid.", "-1 → hi = mid − 1. 1 → lo = mid + 1. 0 → return mid."),
    bi("pick chỉ cấu hình API; lời giải nhận n và dùng các phản hồi.", "pick configures the API; the solution receives only n and uses its responses."),
  ],
  complexity: { time: "O(log n)", space: "O(1)", note: bi("Mỗi vòng gọi guess một lần và loại khoảng nửa số ứng viên. Input lớn rút gọn hình; trace vẫn giữ mọi dòng thực thi.", "Each iteration calls guess once and removes about half the candidates. Large inputs condense the picture; the full line trace is preserved.") },
  code: CODE, debugMode: "line-by-line", builder: buildSteps, parseInput,
  liveArgs: (input, params) => [parseInput(input, params).n],
  liveOracle: (input, params) => { const { n, pick } = parseInput(input, params); return { type: "guess-number", n, pick }; },
} };
