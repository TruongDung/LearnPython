"use strict";

const base = require("./string")[65];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const CODE = `class Solution:
    def isNumber(self, s):
        states = [
            {'digit': 2, 'sign': 1, 'dot': 3},
            {'digit': 2, 'dot': 3},
            {'digit': 2, 'dot': 4, 'e': 5},
            {'digit': 4},
            {'digit': 4, 'e': 5},
            {'sign': 6, 'digit': 7},
            {'digit': 7},
            {'digit': 7},
        ]
        accepting = {2, 4, 7}
        state = 0
        for i, ch in enumerate(s):
            if '0' <= ch <= '9':
                g = 'digit'
            elif ch in '+-':
                g = 'sign'
            elif ch == '.':
                g = 'dot'
            elif ch in 'eE':
                g = 'e'
            else:
                g = 'invalid'
            if g not in states[state]:
                return False
            state = states[state][g]
        return state in accepting`.split("\n");

function parse(input) {
  if (typeof input !== "string" || [...input].length > 20) {
    throw new RangeError("#65: s là chuỗi tối đa 20 ký tự / s must be a string of at most 20 characters.");
  }
  return input;
}

const PHASES = {
  13: bi("Các trạng thái có thể dừng ✓", "Accepting states ✓"),
  14: bi("Bắt đầu ở S0", "Start at S0"),
  15: bi("Đọc ký tự tiếp", "Read the next character"),
  16: bi("Chữ số 0–9?", "Digit 0–9?"),
  17: bi("Chữ số 0–9", "Digit 0–9"),
  18: bi("Dấu + hoặc −?", "Sign + or −?"),
  19: bi("Dấu + hoặc −", "Sign + or −"),
  20: bi("Dấu chấm?", "Decimal point?"),
  21: bi("Dấu chấm", "Decimal point"),
  22: bi("Số mũ e/E?", "Exponent e/E?"),
  23: bi("Số mũ e/E", "Exponent e/E"),
  25: bi("Ký tự khác", "Other character"),
  26: bi("Thiếu cạnh cho ký tự này?", "Missing a transition?"),
  27: bi("Không có đường đi → False", "No transition → False"),
  28: bi("Chuyển trạng thái →", "Move to the next state →"),
  29: bi("Đã đủ một số hoàn chỉnh?", "Is the number complete?"),
};

function builder(input) {
  const s = parse(input), chars = [...s];
  const trace = runTrace({ code: CODE.join("\n"), method: "isNumber", args: [s] });
  // The diagram is a reference map of the actual Python table. It does not bind
  // states/accepting/state in the debugger before those assignments execute.
  const machine = trace.events.find(e => e.locals.states)?.locals.states;
  const accepting = trace.events.find(e => e.locals.accepting)?.locals.accepting;
  const consumed = Array(chars.length).fill(null), trail = [];
  let cursor = null, classified = null, lookup = null, move = null, previousState = null;
  const steps = trace.events.map(record => {
    const { line, locals: x } = record;
    if (line === 15) {
      cursor = record.branch ? x.i : chars.length;
      classified = null; lookup = null; move = null;
    }
    if ([17, 19, 21, 23, 25].includes(line)) classified = x.g;
    if (line === 26) {
      const next = x.states[x.state][x.g];
      lookup = { from: x.state, to: next ?? null, group: x.g, index: x.i, char: x.ch, allowed: next !== undefined };
    }
    if (line === 28) {
      move = { from: previousState, to: x.state, group: x.g, index: x.i, char: x.ch };
      trail.push(move);
      consumed[x.i] = x.g === "e" || previousState >= 5 ? "exponent" : x.g;
    }
    const final = record.returning;
    const phase = line <= 12 ? bi("Tạo bản đồ DFA", "Build the DFA map")
      : line === 15 && record.branch === false ? bi("Đã hết ký tự · END", "No characters left · END") : PHASES[line];
    const view = {
      s, chars, cursor, classified, lookup: lookup && { ...lookup }, move: move && { ...move },
      state: x.state ?? null, machine, accepting, machineReady: Array.isArray(x.states),
      acceptingReady: Array.isArray(x.accepting), consumed: [...consumed], trail: trail.map(item => ({ ...item })),
      source: { line, text: CODE[line - 1].trim(), timing: "after" }, phase,
      locals: x, outer: record.outer, frames: record.frames, scope: record.scope,
      branch: record.branch, returned: record.returned, returning: final, trace: trace.trace,
      answer: final ? trace.answer : null,
      errorIndex: final && !trace.answer && line === 27 ? x.i : null,
      reason: final ? trace.answer ? "valid" : line === 27 ? "blocked" : "incomplete" : null,
    };
    previousState = x.state ?? null;
    return {
      arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final,
      title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: ["i", "ch", "g", "state"].map(name => ({ name, value: x[name] ?? "—", rawValue: x[name] ?? null })),
      validNumber65View: view,
    };
  });
  return { original: s, answer: trace.answer, steps };
}

module.exports = { 65: {
  ...base, defaultInput: "+3.14e-2", allowEmptyInput: true, preserveInputWhitespace: true, debugMode: "line-by-line",
  titleVi: bi("Kiểm tra số hợp lệ", "Validate a number"),
  statement: bi("Kiểm tra toàn bộ s: số nguyên hoặc thập phân, có thể có dấu và số mũ e/E. Sau e/E phải là số nguyên.",
    "Validate the entire string: an integer or decimal, with an optional sign and exponent e/E. The exponent must be an integer."),
  inputLabel: bi("s · tối đa 20 ký tự", "s · up to 20 characters"), extraParams: [],
  approach: [bi("Mỗi ký tự đi qua một cạnh DFA. Hết chuỗi ở S2, S4 hoặc S7 → True.",
    "Each character follows one DFA edge. Finish at S2, S4 or S7 → True.")],
  complexity: { time: "O(n)", space: "O(1)", note: bi("Bảng 8 trạng thái cố định; duyệt chuỗi một lần.", "A fixed eight-state table; one pass over the string.") },
  code: CODE, codeLabel: bi("DFA · từng dòng Python", "DFA · Python line by line"),
  visualizationLimits: { maxCharacters: 20, completeTrace: true }, builder, liveArgs: input => [parse(input)],
} };
